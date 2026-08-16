/**
 * Town progress tracker — real, sourced provincial projects.
 *
 * Every row cites the article or agency release it came from and carries a
 * verification date. Nothing here is estimated: where the source does not state
 * a cost or a completion percentage, the column stays null rather than being
 * guessed at. That is the same discipline that emptied the DPWH dataset during
 * the rebrand audit.
 *
 *   npm run db:projects
 */
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/postgres';
const sql = postgres(url, { max: 1 });
const VERIFIED = '2026-08-16';

const PGI = 'Province of Isabela — official news';
const PIA = 'Philippine Information Agency';
const DPWH = 'Department of Public Works and Highways';

const PROJECTS = [
  {
    town: null,
    title: '264 new classrooms across the province',
    category: 'Education',
    status: 'ongoing',
    percent: null,
    cost: null,
    funding: 'Provincial Government of Isabela with SDO Isabela',
    description:
      'Construction of 264 classrooms to relieve overcrowding in public schools, expected to benefit around 9,000 learners. Groundwork began July 2026.',
    sourceName: PGI,
    sourceUrl: 'https://provinceofisabela.gov.ph/isabela-to-build-over-260-new-classrooms/',
  },
  {
    town: 'ilagan-city',
    title: 'Isabela Pallet Manufacturing Facility',
    category: 'Environment',
    status: 'ongoing',
    percent: null,
    cost: null,
    funding: 'Provincial Government of Isabela',
    description:
      'A circular-economy facility inside the Provincial Capitol Complex that converts plastic waste into industrial pallets for the province’s agricultural supply chain.',
    sourceName: PGI,
    sourceUrl:
      'https://provinceofisabela.gov.ph/the-isabela-pallet-manufacturing-facility-keeping-plastic-out-of-landfills/',
  },
  {
    town: null,
    title: 'Vertical axis wind turbine pilot',
    category: 'Energy',
    status: 'proposed',
    percent: null,
    cost: null,
    funding: "Tokyo Global South GX Promotion Project, with Challenergy Inc.",
    description:
      'First deployment of an off-grid vertical axis wind turbine in the province, introduced to provincial officials in April 2026 under a Tokyo-funded promotion project.',
    sourceName: PGI,
    sourceUrl:
      'https://provinceofisabela.gov.ph/isabela-to-test-wind-turbine-under-tokyo-japans-promotion-project/',
  },
  {
    town: null,
    title: 'Tuberculosis programme strengthening (TIFA Phase 2)',
    category: 'Health',
    status: 'funded',
    percent: null,
    cost: 6_200_000,
    funding: 'JSI Research & Training Institute, via the US Department of State',
    description:
      'Second-round grant to raise TB case detection by 10–15% from baseline, covering drug-sensitive and drug-resistant cases, administered through the Integrated Provincial Health Office.',
    sourceName: PGI,
    sourceUrl: 'https://provinceofisabela.gov.ph/isabela-to-receive-p6-2m-grant-to-strengthen-tb-program/',
  },
  {
    town: 'jones',
    title: 'Barangay Dicamay II water system and road concreting',
    category: 'Roads & water',
    status: 'completed',
    percent: 100,
    cost: null,
    funding: '513th Engineer Construction Battalion, 502nd Infantry Brigade and LGU Jones',
    description:
      'Over 10 kilometres of concreted road and a new water system for a previously isolated barangay. Concreting began 3 July 2025; inaugurated 30 May 2026.',
    sourceName: PIA,
    sourceUrl:
      'https://pia.gov.ph/news/luzon/cv/remote-isabela-village-gets-clean-water-concrete-roads-after-years-of-isolation/',
  },
  {
    town: 'ramon',
    title: 'Rolling Hills tourism access road',
    category: 'Roads & water',
    status: 'completed',
    percent: 100,
    cost: null,
    funding: 'DPWH Tourism Road Infrastructure Program',
    description:
      '565.5 linear metres of concrete access road to the Rolling Hills, delivered by the DPWH Isabela 3rd District Engineering Office.',
    sourceName: DPWH,
    sourceUrl: 'https://www.dpwh.gov.ph/',
  },
  {
    town: null,
    title: 'Three-year provincial health roadmap',
    category: 'Health',
    status: 'ongoing',
    percent: null,
    cost: null,
    funding: 'Integrated Provincial Health Office',
    description:
      'A three-year investment plan setting priority projects to close gaps in the provincial health system, presented September 2025.',
    sourceName: PGI,
    sourceUrl: 'https://provinceofisabela.gov.ph/isabela-rolls-out-3-year-health-roadmap-to-bridge-system-gaps/',
  },
  {
    town: null,
    title: 'Seasonal Workers Programme deployment to South Korea',
    category: 'Livelihood',
    status: 'ongoing',
    percent: null,
    cost: null,
    funding: 'Provincial Government of Isabela',
    description:
      '174 Isabelino farmers deployed to South Korea under the Seasonal Workers Programme, April 2026.',
    sourceName: PGI,
    sourceUrl: 'https://provinceofisabela.gov.ph/isabela-govt-sends-174-isabelino-farmers-to-south-korea-under-swp/',
  },
];

let inserted = 0;
for (const p of PROJECTS) {
  const [dupe] = await sql`SELECT id FROM projects WHERE title = ${p.title}`;
  if (dupe) continue;
  await sql`
    INSERT INTO projects (town_slug, title, description, category, status, percent_complete,
                          cost_centavos, funding_source, source_name, source_url, verified_on)
    VALUES (${p.town}, ${p.title}, ${p.description}, ${p.category}, ${p.status}, ${p.percent},
            ${p.cost === null ? null : p.cost * 100}, ${p.funding}, ${p.sourceName},
            ${p.sourceUrl}, ${VERIFIED})`;
  inserted += 1;
}

const rows = await sql`SELECT status, count(*)::int AS n FROM projects GROUP BY status ORDER BY n DESC`;
console.log(`Projects: ${inserted} inserted.`);
for (const r of rows) console.log(`  ${r.n} ${r.status}`);
const [{ n }] = await sql`SELECT count(*)::int AS n FROM projects WHERE source_url IS NULL`;
console.log(n === 0 ? '  every project cites a source' : `  WARNING: ${n} without a source`);
await sql.end();
