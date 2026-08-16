# BetterIsabela Rebrand Audit

Last updated: 2026-08-16

## Stabilized in an earlier checkpoint

- Provincial leadership and Sangguniang Panlalawigan membership now match the official Province of Isabela directory.
- Headline population and administrative figures now use the PSA 2024 POPCEN/PSGC values.
- The homepage map points to the Isabela Provincial Capitol in Alibagu, City of Ilagan.
- The homepage history describes the Province of Isabela rather than the former Solano municipality.
- Provincial and PSWDO route renames are consistent across navigation, canonical metadata, search data, and the sitemap; Apache redirects preserve retired URLs.
- Relabeled Solano ordinances and resolutions were removed. Their JSON feeds remain empty until records are curated from the official Sangguniang Panlalawigan source.
- Unverified detailed statistics are hidden from the public statistics page while province-level data is curated.
- Office email addresses were researched and replaced with genuine Isabela provincial addresses.

## Fixed in the 2026-08-16 link and data audit

The rebrand had been applied largely as a find/replace of "Solano" with "Isabela". That produced
URLs, phone numbers and datasets that looked plausible but pointed at the wrong place — or nowhere.

### Wrong official-website domain (highest severity)

`provinceofisabela.ph` was linked 182 times across 53 files as the official provincial site.
It is **not** a government site: every path returns an identical obfuscated "Redirecting…" stub
carrying ad-overlay and DFP container markers — a parked, ad-monetised domain. All references were
repointed to the genuine site, `provinceofisabela.gov.ph`:

| Old (parked domain)                                               | New (official)                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| `/index.php/using-joomla/.../556-citizen-s-charter`               | `/transparency/citizens-charter/`                      |
| `/index.php/using-joomla/.../683-ordinances-and-resolutions-2025` | `/ordinanceresolution/`                                |
| `/index.php/component/content/article?id=351&layout=edit`         | `/officials/governor/` and `/officials/vice-governor/` |
| `/index.php/2013-07-09-01-29-21`                                  | `/directory/`                                          |
| site root                                                         | site root                                              |

### Emergency and office contact numbers

Every `tel:` link on the site was byte-identical to the pre-rebrand Solano site — including the
site-wide hotline bar on 50+ pages, where "DILG: 0906 188 086" was only ten digits and could not
be dialled at all. The contact and public-safety pages carried a "NUVELCO **Isabela**" card
(NUVELCO is the _Nueva Vizcaya_ electric cooperative) and one card still literally labelled
"PDRRMO N. Vizcaya".

- Added `data/contacts.json` as the canonical, source-backed directory (28 offices, 4 emergency
  numbers, 7 hospitals) taken from the official directory and emergency-hotlines pages.
- Rebuilt the site-wide hotline bar, the contact and public-safety hotline grids, the offline
  fallback list and the affected office pages from that file.
- All 21 distinct `tel:` links on the site now resolve to an entry in `data/contacts.json`.
- Corrected the Provincial Capitol postcode: 3708 is Solano, Nueva Vizcaya. Isabela's capitol is
  Alibagu, City of Ilagan 3300.

### Invented or wrong-LGU third-party links

| Link                                                              | Problem                                                                                                                                              | Action                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `filipizen.com/partners/nuevavizcaya_isabela/*` (5 payment links) | Renamed from `nuevavizcaya_solano`. Filipizen returns HTTP 200 for _any_ path, so the links looked healthy while pointing at a Nueva Vizcaya portal. | Removed from pages, `data/services.json` and the sitemap        |
| `isabelagovernorsoffice-oasys.com`                                | Renamed from `solanomayorsoffice-oasys.com`; domain does not resolve                                                                                 | Appointment CTA section removed                                 |
| `quiz.betterisabela.org`                                          | Renamed from `quiz.bettersolano.org`; DNS NXDOMAIN                                                                                                   | Quiz CTA and 52 footer links removed                            |
| `github.com/BetterIsabela/betterisabela`                          | Organisation does not exist (404)                                                                                                                    | Removed from pages; README notes the clone URL is not live yet  |
| `linkedin.com/company/betterisabela`                              | Page does not exist (404)                                                                                                                            | Removed from pages and docs                                     |
| `facebook.com/profile.php?id=61564916854423`                      | Redirects to "PESO **Solano**"                                                                                                                       | Removed; PESO card now uses the official provincial PESO number |

### Filipino and Ilocano treated Isabela as a municipality

English had been updated to provincial terminology but the other two locales had not. 357 strings
still called Isabela a municipality — including `title-governor` rendering as "Punong Bayan"
(town mayor) in Filipino and "Governor ti Munisipalidad" in Ilocano.

- Migrated Filipino and Ilocano terminology (Munisipalidad → Lalawigan / Probinsia, Munisipyo →
  Kapitolyo ng Lalawigan / Kapitolio ti Probinsia, Punong Bayan / Alkalde → Gobernador, Konseho ng
  Munisipalidad → Sangguniang Panlalawigan) across both `assets/js/translations.js` and
  `react-app/src/contexts/LanguageContext.tsx`.
- "Cities and Municipalities Competitiveness Index" is a proper noun and was deliberately preserved.
- Rewrote seven Ilocano strings that were partly Tagalog and still said "munisipyo".
- Pruned 1,443 translation entries orphaned by the removals. All three locales hold 5,073 keys with
  exact parity, and all 5,101 key references in markup resolve.

### Solano barangay data published as Isabela

Isabela is a province of 37 cities and municipalities; the site was still publishing Solano's 22
barangays as its own.

- Removed the "Barangays of Isabela" section from `government/index.html` — 22 cards naming real
  individuals as Isabela barangay captains, all of them Solano officials.
- Cleared 63 DPWH project records located in Solano barangays but labelled "Isabela", complete with
  real contractor names and ₱409M of costs. `assets/js/dpwh-projects.js` now renders a
  pending-curation notice instead of an empty table.
- Hid the Barangay Health Station list, the schools directory and the budget infrastructure cards
  pending curation, matching the treatment already applied to the statistics page.
- No Solano barangay name is reachable on any publicly visible surface.

### Other

- `api.exchangerate.host` now requires a paid key and failed on every page load before silently
  falling back. Promoted the working keyless endpoint (`open.er-api.com`) to the only source and
  removed the dead host from the CSP `connect-src`.
- Removed Filipizen from homepage and services meta descriptions and keywords.
- `favicon.svg` still carried `id="better-solano"`.

## Source-backed references

- Governor: <https://provinceofisabela.gov.ph/officials/governor/>
- Vice Governor: <https://provinceofisabela.gov.ph/officials/vice-governor/>
- Board members: <https://provinceofisabela.gov.ph/officials/board-members/>
- Department directory: <https://provinceofisabela.gov.ph/directory/>
- Emergency hotlines: <https://provinceofisabela.gov.ph/emergency-hotlines/>
- Population and administrative units: <https://psa.gov.ph/classification/psgc/citimuni/0203100000>
- Provincial history: <https://provinceofisabela.gov.ph/the-province/history/>
- Citizen's Charter: <https://provinceofisabela.gov.ph/transparency/citizens-charter/>
- Ordinances and resolutions: <https://provinceofisabela.gov.ph/ordinanceresolution/>

Note: `psa.gov.ph`, `foi.gov.ph`, `transparency.dpwh.gov.ph`, `privacy.gov.ph` and
`sumbongsapangulo.ph` answer automated requests with HTTP 403. They are live; their WAFs block
non-browser clients. `npm run audit:external` reports them as 403, not as failures.

## Remaining content migration

Still legacy Solano data or assumptions. Curate against a named source — do not mechanically rename:

- `data/services.json` — service catalogue still reflects municipal service delivery
- `data/news.json`
- `data/competitive-index.json`
- `data/dpwh-projects.json` — emptied; repopulate from the DPWH transparency portal filtered to Isabela
- hidden sections in `budget/index.html`, `statistics/index.html`, `services/health.html`,
  `services/education.html` — unhide only once each figure has a source and verification date
- detailed service pages for local civil registry, business licensing, public market,
  slaughterhouse and barangay-level services
- Filipino and Ilocano strings that mix in Tagalog or English mid-sentence — terminology is now
  correct but fluency has not been reviewed by a speaker

## Launch blockers

These need a decision or an asset before the site goes public:

1. Create the `BetterIsabela` GitHub organisation, or repoint the clone URLs in `README.md`,
   `CONTRIBUTING.md` and `MIGRATION.md`.
2. Create the LinkedIn page and `quiz.betterisabela.org`, or leave them out.
3. Supply genuine Isabela online-payment and appointment-booking URLs if those services exist;
   the Filipizen and OASYS sections were removed rather than shipped pointing at the wrong LGU.
4. `scripts/fix-footer-quiz-copyright.py` is a one-off migration script that re-inserts the quiz
   link. Do not re-run it against the current tree.

## Next recommended milestone

Import the 2025 Isabela Citizen's Charter office by office, beginning with the Provincial Treasurer,
Assessor, PSWDO, Agriculture, Engineering, Planning, Budget, Accounting, General Services and Human
Resource offices. Replace the legacy service catalog only after the matching office page has
source-backed requirements, fees, processing times and contact details.
