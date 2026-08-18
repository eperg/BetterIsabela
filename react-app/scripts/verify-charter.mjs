/**
 * Checks the Citizen's Charter parser against every string the catalogue
 * actually contains, plus the edge cases that would misreport a government
 * promise if they broke.
 *
 * This matters more than most parsing: the output is published as a claim about
 * whether an office met its own commitment. A parser that reads "1 hour 35
 * minutes" as 35 minutes would accuse an office of being slow when it was not.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// Imported straight from TypeScript: Node strips the types itself, and the
// module deliberately has no imports of its own so there is nothing to resolve.
const { parseCharterTime, parseCharterFee, medianWait, verdictFor } = await import(
  '../src/lib/charter.ts'
);

let failed = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${ok ? '' : ` — got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`}`);
};

console.log('CHARTER TIME');
const TIME_CASES = [
  ['5 minutes', 5],
  ['15-30 minutes', 30],
  ['1 hour 35 minutes', 95],
  ['37 min - 1.5 hrs', 90],
  ['28 min - 1.5 hrs', 90],
  ['15 min - 1 day', 480],
  ['Same day', 480],
  ['1-2 days', 960],
  ['1-3 days', 1440],
  ['1-5 days', 2400],
  ['3-5 days', 2400],
  ['3-7 days', 3360],
  ['5-10 days', 4800],
  ['1-2 weeks', 4800],
  ['Immediate', 0],
  ['Varies', null],
  ['Scheduled', null],
];
for (const [text, want] of TIME_CASES) {
  check(text, parseCharterTime(text).maxMinutes, want);
}

console.log('\nCHARTER FEE');
const FEE_CASES = [
  ['₱150', 15000],
  ['₱50-150', 15000],
  ['₱50-100', 10000],
  ['₱40-350', 35000],
  ['Free', 0],
  ['Free (Registration)', 0],
  ['Varies', null],
  ['₱5+', null],
  ['Subsidized', null],
  ['Free/Subsidized', null],
  ['Included in tax', null],
];
for (const [text, want] of FEE_CASES) {
  check(text, parseCharterFee(text).maxCentavos, want);
}

console.log('\nEVERY STRING IN THE CATALOGUE PARSES OR IS EXPLICITLY OPEN-ENDED');
const { services } = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'public', 'data', 'services.json'), 'utf8')
);
const unparsed = services
  .map((s) => s.processingTime)
  .filter(Boolean)
  .filter((t) => parseCharterTime(t).maxMinutes === null)
  .filter((t) => !/varies|scheduled/i.test(t));
check(`${services.length} services, none silently unparsed`, unparsed, []);

console.log('\nMEDIAN AND VERDICT');
check('median of one', medianWait({ '1_3h': 1 }), '1_3h');
check('median of three', medianWait({ under_30m: 1, '1_3h': 1, over_week: 1 }), '1_3h');
check('median skews to the slow half on even counts', medianWait({ under_30m: 2, over_week: 2 }), 'over_week');
check('no reports', medianWait({}), null);
check(
  'within when the median fits the promise',
  verdictFor(parseCharterTime('15-30 minutes'), 'under_30m'),
  'within'
);
check(
  'over when it does not',
  verdictFor(parseCharterTime('15-30 minutes'), '1_3h'),
  'over'
);
check(
  'no promise is never reported as a breach',
  verdictFor(parseCharterTime('Varies'), 'over_week'),
  'no_promise'
);
check('unresolved outranks any duration', verdictFor(parseCharterTime('Varies'), 'unresolved'), 'unresolved');

console.log(failed ? `\n${failed} failure(s)` : '\nall checks passed');
process.exit(failed ? 1 : 0);
