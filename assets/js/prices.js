/**
 * Price Watch renderer.
 *
 * Reads data/prices.json (built by scripts/sync-prices.js from PSA OpenSTAT and
 * DA Bantay Presyo) and renders three things:
 *
 *   1. The headline gap — farmgate palay against average market rice, because
 *      neither the farmer nor the buyer can currently see both numbers at once.
 *   2. Farmgate trend per commodity, with a sparkline and the 12-month range.
 *   3. Market prices per commodity, per Isabela town, with the cheapest and
 *      dearest market called out — the practical decision for a buyer.
 *
 * Everything degrades: a missing file, a missing section, or a source that was
 * unavailable at sync time each render an explanatory state rather than an empty
 * page. No third-party charting library — the sparkline is inline SVG.
 */
(function () {
  'use strict';

  var DATA_URL = '../data/prices.json';
  var PESO = '₱';

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  /** Escapes text bound for innerHTML. All price data is third-party. */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** TranslationEngine.t() echoes the key back when a string is missing. */
  function t(key, fallback) {
    var engine = window.TranslationEngine;
    if (engine && typeof engine.t === 'function') {
      var value = engine.t(key);
      if (value && value !== key) return value;
    }
    return fallback;
  }

  function peso(value, decimals) {
    if (value == null || isNaN(value)) return '—';
    return PESO + Number(value).toFixed(decimals == null ? 2 : decimals);
  }

  var MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /** "2026-05" -> "May 2026" */
  function periodLabel(period) {
    if (!period) return '';
    var parts = String(period).split('-');
    var month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
    return month ? month + ' ' + parts[0] : period;
  }

  /** Inline sparkline. Avoids pulling a charting library onto a rural connection. */
  function sparkline(points) {
    if (!points || points.length < 2) return '';
    var w = 240;
    var h = 48;
    var pad = 3;
    var values = points.map(function (p) {
      return p.price;
    });
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = max - min || 1;
    var step = (w - pad * 2) / (points.length - 1);

    var coords = points.map(function (p, i) {
      var x = pad + i * step;
      var y = pad + (h - pad * 2) * (1 - (p.price - min) / span);
      return [x, y];
    });
    var line = coords
      .map(function (c, i) {
        return (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
      })
      .join(' ');
    var area =
      line +
      ' L' +
      coords[coords.length - 1][0].toFixed(1) +
      ' ' +
      (h - pad) +
      ' L' +
      coords[0][0].toFixed(1) +
      ' ' +
      (h - pad) +
      ' Z';
    var last = coords[coords.length - 1];

    return (
      '<svg class="price-spark" viewBox="0 0 ' +
      w +
      ' ' +
      h +
      '" role="img" ' +
      'aria-label="' +
      esc(t('prices-spark-label', 'Price trend over the last months')) +
      '" ' +
      'preserveAspectRatio="none">' +
      '<path class="price-spark-area" d="' +
      area +
      '" />' +
      '<path class="price-spark-line" d="' +
      line +
      '" />' +
      '<circle class="price-spark-dot" cx="' +
      last[0].toFixed(1) +
      '" cy="' +
      last[1].toFixed(1) +
      '" r="3" />' +
      '</svg>'
    );
  }

  /** Percentage change between the first and last point of a window. */
  function changeOver(points, months) {
    if (!points || points.length < 2) return null;
    var window_ = points.slice(-months);
    if (window_.length < 2) return null;
    var first = window_[0].price;
    var last = window_[window_.length - 1].price;
    if (!first) return null;
    return {
      pct: ((last - first) / first) * 100,
      from: window_[0],
      to: window_[window_.length - 1],
    };
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  function renderHeadline(el, data) {
    var spread = data.spread;
    if (!spread) {
      el.innerHTML =
        '<p class="price-empty">' +
        esc(
          t(
            'prices-headline-unavailable',
            'The farmgate and market comparison is unavailable until both sources report.'
          )
        ) +
        '</p>';
      return;
    }

    el.innerHTML =
      '<div class="price-headline-grid">' +
      '<div class="price-headline-item">' +
      '<span class="price-headline-label">' +
      esc(t('prices-headline-farmgate', 'Farmer is paid for palay')) +
      '</span>' +
      '<span class="price-headline-value">' +
      esc(peso(spread.farmgatePalay)) +
      '<small>/kg</small></span>' +
      '<span class="price-headline-note">' +
      esc(periodLabel(spread.farmgatePeriod)) +
      '</span>' +
      '</div>' +
      '<div class="price-headline-sep" aria-hidden="true">' +
      '<span class="price-headline-arrow">&rarr;</span>' +
      '</div>' +
      '<div class="price-headline-item">' +
      '<span class="price-headline-label">' +
      esc(t('prices-headline-market', 'Market charges for rice')) +
      '</span>' +
      '<span class="price-headline-value">' +
      esc(peso(spread.retailRiceAverage)) +
      '<small>/kg</small></span>' +
      '<span class="price-headline-note">' +
      esc(t('prices-headline-market-note', 'Regular milled, average of Isabela markets')) +
      '</span>' +
      '</div>' +
      '<div class="price-headline-item price-headline-item--gap">' +
      '<span class="price-headline-label">' +
      esc(t('prices-headline-gap', 'Difference')) +
      '</span>' +
      '<span class="price-headline-value">' +
      esc(peso(spread.spread)) +
      '<small>/kg</small></span>' +
      '<span class="price-headline-note">' +
      esc(
        t(
          'prices-headline-gap-note',
          'Palay and milled rice are different goods — treat this as an indication, not a margin.'
        )
      ) +
      '</span>' +
      '</div>' +
      '</div>';
  }

  function renderFarmgate(el, farmgate) {
    if (!farmgate || !farmgate.series || !farmgate.series.length) {
      el.innerHTML =
        '<p class="price-empty">' +
        esc(
          t(
            'prices-farmgate-unavailable',
            'Farmgate prices are being retrieved from the Philippine Statistics Authority.'
          )
        ) +
        '</p>';
      return;
    }

    el.innerHTML = farmgate.series
      .map(function (series) {
        var latest = series.latest;
        var change = changeOver(series.points, 13);
        var direction = change
          ? change.pct > 0.5
            ? 'up'
            : change.pct < -0.5
              ? 'down'
              : 'flat'
          : 'flat';
        var recent = series.points.slice(-24);
        var values = recent.map(function (p) {
          return p.price;
        });
        var low = values.length ? Math.min.apply(null, values) : null;
        var high = values.length ? Math.max.apply(null, values) : null;

        return (
          '<article class="price-card">' +
          '<header class="price-card-head">' +
          '<h3>' +
          esc(series.label) +
          '</h3>' +
          (latest
            ? '<span class="price-card-period">' + esc(periodLabel(latest.period)) + '</span>'
            : '') +
          '</header>' +
          '<div class="price-card-figure">' +
          '<span class="price-card-value">' +
          esc(peso(latest && latest.price)) +
          '<small>/kg</small></span>' +
          (change
            ? '<span class="price-delta price-delta--' +
              direction +
              '">' +
              (change.pct > 0 ? '&uarr; ' : change.pct < 0 ? '&darr; ' : '') +
              esc(Math.abs(change.pct).toFixed(1)) +
              '%' +
              '<small>' +
              esc(t('prices-vs-year', 'vs a year earlier')) +
              '</small>' +
              '</span>'
            : '') +
          '</div>' +
          sparkline(recent) +
          (low != null
            ? '<dl class="price-range">' +
              '<div><dt>' +
              esc(t('prices-range-low', 'Lowest')) +
              '</dt>' +
              '<dd>' +
              esc(peso(low)) +
              '</dd></div>' +
              '<div><dt>' +
              esc(t('prices-range-high', 'Highest')) +
              '</dt>' +
              '<dd>' +
              esc(peso(high)) +
              '</dd></div>' +
              '<div><dt>' +
              esc(t('prices-range-months', 'Months shown')) +
              '</dt>' +
              '<dd>' +
              esc(recent.length) +
              '</dd></div>' +
              '</dl>'
            : '') +
          '</article>'
        );
      })
      .join('');
  }

  function renderMarketTable(category) {
    // Union of markets present anywhere in this category, in first-seen order.
    var markets = [];
    category.items.forEach(function (item) {
      item.markets.forEach(function (m) {
        if (markets.indexOf(m.market) === -1) markets.push(m.market);
      });
    });
    if (!markets.length) return '';

    var head =
      '<tr><th scope="col">' +
      esc(t('prices-col-commodity', 'Commodity')) +
      '</th>' +
      markets
        .map(function (m) {
          return '<th scope="col">' + esc(m.replace(/\s*PUBLIC MARKET$/i, '')) + '</th>';
        })
        .join('') +
      '</tr>';

    var body = category.items
      .map(function (item) {
        var prices = item.markets.map(function (m) {
          return m.price;
        });
        var min = Math.min.apply(null, prices);
        var max = Math.max.apply(null, prices);
        // Cheapest/dearest is only meaningful when the markets actually differ.
        var comparable = prices.length > 1 && min !== max;
        var cells = markets
          .map(function (name) {
            var hit = null;
            item.markets.forEach(function (m) {
              if (m.market === name) hit = m;
            });
            if (!hit) return '<td class="price-na">&mdash;</td>';
            var cls = !comparable
              ? ''
              : hit.price === min
                ? ' price-low'
                : hit.price === max
                  ? ' price-high'
                  : '';
            return '<td class="price-num' + cls + '">' + esc(peso(hit.price, 0)) + '</td>';
          })
          .join('');
        return (
          '<tr><th scope="row">' +
          esc(item.commodity) +
          (item.specification ? '<small>' + esc(item.specification) + '</small>' : '') +
          '</th>' +
          cells +
          '</tr>'
        );
      })
      .join('');

    return (
      '<div class="price-table-wrap">' +
      '<table class="price-table">' +
      '<caption>' +
      esc(category.label) +
      '</caption>' +
      '<thead>' +
      head +
      '</thead>' +
      '<tbody>' +
      body +
      '</tbody>' +
      '</table>' +
      '</div>'
    );
  }

  function renderMarkets(el, retail) {
    if (!retail || !retail.categories || !retail.categories.length) {
      el.innerHTML =
        '<p class="price-empty">' +
        esc(
          t(
            'prices-market-unavailable',
            'Market prices are being retrieved from the Department of Agriculture.'
          )
        ) +
        '</p>';
      return;
    }

    var asOf = retail._asOf
      ? '<p class="price-asof">' +
        esc(t('prices-as-of', 'Prices as of')) +
        ' <strong>' +
        esc(retail._asOf) +
        '</strong>' +
        '</p>'
      : '';

    var legend =
      '<p class="price-legend">' +
      '<span class="price-legend-item"><span class="price-swatch price-swatch--low"></span>' +
      esc(t('prices-legend-low', 'Cheapest market')) +
      '</span>' +
      '<span class="price-legend-item"><span class="price-swatch price-swatch--high"></span>' +
      esc(t('prices-legend-high', 'Dearest market')) +
      '</span>' +
      '</p>';

    el.innerHTML =
      asOf +
      legend +
      retail.categories
        .filter(function (c) {
          return c.items && c.items.length;
        })
        .map(renderMarketTable)
        .join('');
  }

  function renderSources(el, data) {
    var rows = [];
    if (data.farmgate) {
      rows.push({
        name: data.farmgate._sourceName,
        url: data.farmgate._source,
        note: data.farmgate._note,
      });
    }
    if (data.retail) {
      rows.push({
        name: data.retail._sourceName,
        url: data.retail._source,
        note: data.retail._note,
      });
    }
    if (!rows.length) return;

    var generated = data._generated
      ? '<li class="price-source price-source--meta">' +
        esc(t('prices-updated', 'This page was last rebuilt on')) +
        ' ' +
        '<time datetime="' +
        esc(data._generated) +
        '">' +
        esc(
          new Date(data._generated).toLocaleString('en-PH', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        ) +
        '</time></li>'
      : '';

    el.innerHTML =
      rows
        .map(function (r) {
          return (
            '<li class="price-source">' +
            '<a href="' +
            esc(r.url) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(r.name) +
            '</a>' +
            (r.note ? '<span>' + esc(r.note) + '</span>' : '') +
            '</li>'
          );
        })
        .join('') + generated;
  }

  // -------------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------------

  function fail(message) {
    var headline = document.getElementById('price-headline');
    if (headline) {
      headline.innerHTML = '<p class="price-empty">' + esc(message) + '</p>';
    }
  }

  /**
   * Injected markup has no data-i18n attributes, so the engine's own DOM walk
   * cannot reach it. Re-render the whole view whenever the language changes.
   */
  function renderAll(data) {
    renderHeadline(document.getElementById('price-headline'), data);
    renderFarmgate(document.getElementById('price-farmgate'), data.farmgate);
    renderMarkets(document.getElementById('price-markets'), data.retail);
    renderSources(document.getElementById('price-sources'), data);
  }

  function init() {
    var headline = document.getElementById('price-headline');
    if (!headline) return; // not the Price Watch page

    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        renderAll(data);
        document.addEventListener('languageChanged', function () {
          renderAll(data);
        });
      })
      .catch(function (error) {
        console.error('Price Watch: failed to load prices', error);
        fail(
          t(
            'prices-load-failed',
            'Prices could not be loaded right now. If you are offline, the last saved prices will ' +
              'appear once you reconnect.'
          )
        );
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
