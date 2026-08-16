/**
 * Homepage price overview + town browser.
 *
 * Two sections, one data load:
 *
 *   1. Price overview — the provincial farmgate figures for palay and corn, plus
 *      the average market rice price, as a compact strip under the hero.
 *   2. Town browser — all 37 cities and municipalities as filterable links, with
 *      a detail panel for the selected town.
 *
 * Only five Isabela towns have a market monitored by the DA (Ilagan, Cauayan,
 * Santiago, Roxas, Tumauini). The other 32 are shown honestly: the provincial
 * farmgate price still applies to them, but there is no local retail series, and
 * the panel says so rather than implying coverage that does not exist.
 *
 * Deep-linkable: /#town-ilagan-city opens that town directly.
 */
(function () {
  'use strict';

  var TOWNS_URL = 'data/towns.json';
  var PRICES_URL = 'data/prices.json';
  var PESO = '₱';

  var state = { towns: [], prices: null, selected: null };

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

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

  function num(value) {
    if (value == null || isNaN(value)) return '—';
    return Number(value).toLocaleString('en-PH');
  }

  var MONTHS = [
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

  function periodLabel(period) {
    if (!period) return '';
    var parts = String(period).split('-');
    var month = MONTHS[parseInt(parts[1], 10) - 1];
    return month ? month + ' ' + parts[0] : period;
  }

  /** Slugs are already URL-safe, but never trust data with a DOM id. */
  function safeSlug(slug) {
    return String(slug).replace(/[^a-z0-9-]/gi, '');
  }

  // -------------------------------------------------------------------------
  // Price overview
  // -------------------------------------------------------------------------

  function seriesFor(commodity) {
    var list = (state.prices && state.prices.farmgate && state.prices.farmgate.series) || [];
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].commodity === commodity) return list[i];
    }
    return null;
  }

  function priceTile(label, value, note, variant) {
    return (
      '<div class="home-price-tile' +
      (variant ? ' home-price-tile--' + variant : '') +
      '">' +
      '<span class="home-price-label">' +
      esc(label) +
      '</span>' +
      '<span class="home-price-value">' +
      esc(value) +
      '<small>/kg</small></span>' +
      '<span class="home-price-note">' +
      esc(note) +
      '</span>' +
      '</div>'
    );
  }

  function renderPriceOverview() {
    var el = document.getElementById('home-price-overview');
    if (!el) return;

    if (!state.prices) {
      el.innerHTML =
        '<p class="price-empty">' +
        esc(t('home-price-unavailable', 'Prices are unavailable right now.')) +
        '</p>';
      return;
    }

    var palay = seriesFor('palay');
    var corn = seriesFor('corn-yellow');
    var spread = state.prices.spread;
    var tiles = '';

    if (palay && palay.latest) {
      tiles += priceTile(
        t('home-price-palay', 'Palay — farmgate'),
        peso(palay.latest.price),
        periodLabel(palay.latest.period)
      );
    }
    if (corn && corn.latest) {
      tiles += priceTile(
        t('home-price-corn', 'Yellow corn — farmgate'),
        peso(corn.latest.price),
        periodLabel(corn.latest.period)
      );
    }
    if (spread) {
      tiles += priceTile(
        t('home-price-rice', 'Rice — market average'),
        peso(spread.retailRiceAverage),
        t('home-price-rice-note', 'Regular milled, Isabela markets'),
        'market'
      );
    }

    if (!tiles) {
      el.innerHTML =
        '<p class="price-empty">' +
        esc(t('home-price-unavailable', 'Prices are unavailable right now.')) +
        '</p>';
      return;
    }
    el.innerHTML = '<div class="home-price-grid">' + tiles + '</div>';
  }

  // -------------------------------------------------------------------------
  // Town list
  // -------------------------------------------------------------------------

  function renderTownList(filter) {
    var el = document.getElementById('town-list');
    var empty = document.getElementById('town-empty');
    if (!el) return;

    var needle = (filter || '').trim().toLowerCase();
    var matches = state.towns.filter(function (town) {
      return !needle || town.name.toLowerCase().indexOf(needle) !== -1;
    });

    if (empty) empty.hidden = matches.length > 0;

    el.innerHTML = matches
      .map(function (town) {
        var selected = state.selected && state.selected.slug === town.slug;
        return (
          '<a class="town-chip' +
          (selected ? ' is-selected' : '') +
          '"' +
          ' href="#town-' +
          esc(safeSlug(town.slug)) +
          '"' +
          ' data-slug="' +
          esc(town.slug) +
          '"' +
          (selected ? ' aria-current="true"' : '') +
          '>' +
          '<span class="town-chip-name">' +
          esc(town.name) +
          '</span>' +
          (town.market
            ? '<span class="town-chip-tag" title="' +
              esc(t('home-towns-monitored', 'Market prices monitored here')) +
              '">' +
              esc(t('home-towns-monitored-short', 'prices')) +
              '</span>'
            : '') +
          '</a>'
        );
      })
      .join('');
  }

  // -------------------------------------------------------------------------
  // Town detail
  // -------------------------------------------------------------------------

  function factRow(label, value) {
    return '<div class="town-fact"><dt>' + esc(label) + '</dt><dd>' + esc(value) + '</dd></div>';
  }

  /** Retail rows for this town's market, pulled out of the shared prices file. */
  function marketRows(marketName) {
    var categories = (state.prices && state.prices.retail && state.prices.retail.categories) || [];
    var rows = [];
    categories.forEach(function (category) {
      category.items.forEach(function (item) {
        item.markets.forEach(function (m) {
          if (m.market === marketName) {
            rows.push({ category: category.label, commodity: item.commodity, price: m.price });
          }
        });
      });
    });
    return rows;
  }

  function renderTownDetail() {
    var el = document.getElementById('town-detail');
    if (!el) return;
    var town = state.selected;

    if (!town) {
      el.innerHTML =
        '<p class="town-prompt">' +
        esc(t('home-towns-prompt', 'Select a town above to see its profile and prices.')) +
        '</p>';
      return;
    }

    var facts =
      factRow(t('home-towns-type', 'Type'), town.lguType || '—') +
      factRow(t('home-towns-income', 'Income class'), town.incomeClass || '—') +
      factRow(t('home-towns-barangays', 'Barangays'), num(town.barangays)) +
      factRow(
        t('home-towns-population', 'Population'),
        num(town.population) + (town.censusYear ? ' (' + town.censusYear + ')' : '')
      ) +
      factRow(t('home-towns-households', 'Households'), num(town.households)) +
      factRow(
        t('home-towns-area', 'Land area'),
        town.landAreaHectares ? num(town.landAreaHectares) + ' ha' : '—'
      );

    var officials =
      '<div class="town-officials">' +
      (town.mayor
        ? '<div><span>' +
          esc(t('home-towns-mayor', 'Mayor')) +
          '</span><strong>' +
          esc(town.mayor) +
          '</strong></div>'
        : '') +
      (town.viceMayor
        ? '<div><span>' +
          esc(t('home-towns-vice-mayor', 'Vice Mayor')) +
          '</span><strong>' +
          esc(town.viceMayor) +
          '</strong></div>'
        : '') +
      '</div>';

    var priceBlock;
    if (town.market) {
      var rows = marketRows(town.market);
      priceBlock = rows.length
        ? '<div class="town-prices">' +
          '<h4>' +
          esc(t('home-towns-market-prices', 'Market prices here')) +
          '</h4>' +
          '<ul class="town-price-list">' +
          rows
            .map(function (r) {
              return (
                '<li><span class="town-price-name">' +
                esc(r.commodity) +
                '</span>' +
                '<span class="town-price-value">' +
                esc(peso(r.price, 0)) +
                '</span></li>'
              );
            })
            .join('') +
          '</ul>' +
          '<p class="town-price-src">' +
          esc(town.market) +
          (state.prices.retail._asOf
            ? ' · ' + esc(t('prices-as-of', 'Prices as of')) + ' ' + esc(state.prices.retail._asOf)
            : '') +
          '</p>' +
          '</div>'
        : '';
    } else {
      priceBlock =
        '<div class="town-prices town-prices--none">' +
        '<h4>' +
        esc(t('home-towns-market-prices', 'Market prices here')) +
        '</h4>' +
        '<p>' +
        esc(
          t(
            'home-towns-no-market',
            'No public market in this town is monitored by the Department of Agriculture. ' +
              'The provincial farmgate price above still applies to its farmers.'
          )
        ) +
        '</p>' +
        '</div>';
    }

    el.innerHTML =
      '<article class="town-card" id="town-' +
      esc(safeSlug(town.slug)) +
      '">' +
      '<header class="town-card-head">' +
      '<h3>' +
      esc(town.name) +
      '</h3>' +
      (town.market
        ? '<span class="town-badge">' +
          esc(t('home-towns-monitored', 'Market prices monitored here')) +
          '</span>'
        : '') +
      '</header>' +
      (town.description
        ? '<p class="town-desc">' + esc(town.name) + ' ' + esc(town.description) + '</p>'
        : '') +
      '<dl class="town-facts">' +
      facts +
      '</dl>' +
      officials +
      priceBlock +
      '<a class="town-official-link" href="' +
      esc(town.url) +
      '" target="_blank" ' +
      'rel="noopener noreferrer">' +
      esc(t('home-towns-official', 'Official page for this town')) +
      ' <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>' +
      '</a>' +
      '</article>';
  }

  // -------------------------------------------------------------------------
  // Interaction
  // -------------------------------------------------------------------------

  function findTown(slug) {
    for (var i = 0; i < state.towns.length; i += 1) {
      if (state.towns[i].slug === slug) return state.towns[i];
    }
    return null;
  }

  function select(slug, options) {
    var town = findTown(slug);
    if (!town) return;
    state.selected = town;
    renderTownList(document.getElementById('town-search').value);
    renderTownDetail();
    if (options && options.focus) {
      var detail = document.getElementById('town-detail');
      if (detail) detail.focus({ preventScroll: true });
    }
  }

  function wire() {
    var list = document.getElementById('town-list');
    if (list) {
      list.addEventListener('click', function (event) {
        var chip = event.target.closest('.town-chip');
        if (!chip) return;
        event.preventDefault();
        var slug = chip.getAttribute('data-slug');
        // Keep the URL shareable without making the browser jump.
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#town-' + safeSlug(slug));
        }
        select(slug, { focus: true });
      });
    }

    var search = document.getElementById('town-search');
    if (search) {
      search.addEventListener('input', function () {
        renderTownList(search.value);
      });
    }

    window.addEventListener('hashchange', function () {
      var m = window.location.hash.match(/^#town-([a-z0-9-]+)$/i);
      if (m) select(m[1], { focus: true });
    });

    document.addEventListener('languageChanged', function () {
      renderPriceOverview();
      renderTownList(search ? search.value : '');
      renderTownDetail();
      applyPlaceholders();
    });
  }

  /** data-i18n-placeholder is not part of the shared engine's DOM walk. */
  function applyPlaceholders() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key, el.getAttribute('placeholder') || ''));
    });
  }

  // -------------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------------

  function init() {
    if (!document.getElementById('town-list')) return; // not the homepage

    var wants = function (url) {
      return fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
        return r.json();
      });
    };

    Promise.all([
      wants(TOWNS_URL),
      wants(PRICES_URL).catch(function (error) {
        console.warn('Homepage: prices unavailable', error);
        return null;
      }),
    ])
      .then(function (results) {
        state.towns = (results[0] && results[0].towns) || [];
        state.prices = results[1];

        renderPriceOverview();
        applyPlaceholders();

        var m = window.location.hash.match(/^#town-([a-z0-9-]+)$/i);
        if (m && findTown(m[1])) {
          state.selected = findTown(m[1]);
        }
        renderTownList('');
        renderTownDetail();
        wire();
      })
      .catch(function (error) {
        console.error('Homepage: failed to load town data', error);
        var list = document.getElementById('town-list');
        if (list) {
          list.innerHTML =
            '<p class="price-empty">' +
            esc(t('home-towns-failed', 'The list of towns could not be loaded right now.')) +
            '</p>';
        }
        renderPriceOverview();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
