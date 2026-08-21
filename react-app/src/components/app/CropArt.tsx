/**
 * Rice and mungbean — the two crops the province lives on — drawn beside the
 * hero copy. Inline SVG with CSS keyframes rather than a Lottie or a video:
 * no extra request, it scales to any width, and it stays crisp on the cheap
 * Android screens most of Isabela browses on.
 *
 * Every sway keyframe starts and ends in the neutral pose, so the frozen frame
 * a reduced-motion visitor gets still reads as a finished drawing.
 */

type Pt = readonly [number, number];

/** Soil line the plants grow from, set below the sky disc so they break out of it. */
const BASE_Y = 302;

const round = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A point on a quadratic curve — used to hang grain along a bending stem. */
function pointAt(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    round(u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0]),
    round(u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]),
  ];
}

/** Tangent of the same curve, in degrees, so each grain sits square to its stem. */
function angleAt(p0: Pt, p1: Pt, p2: Pt, t: number): number {
  const u = 1 - t;
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return round((Math.atan2(dy, dx) * 180) / Math.PI);
}

const curve = (p0: Pt, p1: Pt, p2: Pt) => `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`;

type Seed = { x: number; y: number; rot: number; size: number };

/**
 * Grain laid along a curve, alternating sides and splayed outwards, which is
 * what gives a panicle its weight instead of looking like a beaded string.
 */
function seedsAlong(p0: Pt, p1: Pt, p2: Pt, count: number, from: number, size: number): Seed[] {
  return Array.from({ length: count }, (_, i) => {
    const t = from + ((1 - from) * i) / (count - 1);
    const [x, y] = pointAt(p0, p1, p2, t);
    const a = angleAt(p0, p1, p2, t);
    const side = i % 2 === 0 ? 1 : -1;
    const reach = 3.4 * size * side;
    return {
      x: round(x + Math.cos(rad(a + 90)) * reach),
      y: round(y + Math.sin(rad(a + 90)) * reach),
      rot: round(a + 90 + side * 26),
      size,
    };
  });
}

function Grain({ x, y, rot, size, awn }: Seed & { awn: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
      {awn && <path className="ci-awn" d="M0 -5 L1.2 -16" />}
      <ellipse className="ci-grain" rx="2.5" ry="5.3" />
    </g>
  );
}

/** A short upright leaf, three of which make the hill a rice plant grows from. */
const TUFT_LEAF = 'M0 0 C2.6 -10 5 -19 3.2 -27 C0.4 -19 -2.2 -10 0 0 Z';

function Tuft({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[-24, -4, 19].map((rot, i) => (
        <path
          key={rot}
          className="ci-blade ci-blade--low"
          d={TUFT_LEAF}
          transform={`rotate(${rot}) scale(${1 - i * 0.12})`}
        />
      ))}
    </g>
  );
}

/** One rice plant: stem, blades, a hill at its foot, an arching panicle heavy with grain. */
function RiceStalk({
  x,
  height,
  lean,
  size = 1,
  sway,
  delay,
  baseY = BASE_Y,
  tuft = true,
  faded = false,
  detail = 'near',
}: {
  x: number;
  height: number;
  lean: number;
  size?: number;
  /** Omitted for the distant field, which sways as one group instead. */
  sway?: string;
  delay?: string;
  baseY?: number;
  tuft?: boolean;
  faded?: boolean;
  /** Distant crop carries less grain and no awns — nobody can see them at that
      size, and the homepage does not need the extra thousand DOM nodes. */
  detail?: 'near' | 'far';
}) {
  const base: Pt = [x, baseY];
  const tip: Pt = [round(x + lean), round(baseY - height)];
  const ctrl: Pt = [round(x + lean * 0.12), round(baseY - height * 0.62)];
  // The panicle carries on past the tip and folds over under the weight of the
  // grain. That droop is what makes it read as rice and not as tall grass.
  const droopTip: Pt = [round(tip[0] + lean * 0.45 + 18 * size), round(tip[1] + 44 * size)];
  const droopCtrl: Pt = [round(tip[0] + lean * 0.25 + 21 * size), round(tip[1] - 9 * size)];

  const near = detail === 'near';

  const blade = (t: number, dir: 1 | -1, len: number) => {
    const [bx, by] = pointAt(base, ctrl, tip, t);
    return [
      `M${bx} ${by}`,
      `Q${round(bx + dir * len * 0.45)} ${round(by - len * 0.62)}`,
      `${round(bx + dir * len)} ${round(by - len * 0.1)}`,
      `Q${round(bx + dir * len * 0.4)} ${round(by - len * 0.16)}`,
      `${bx} ${round(by + 4)}`,
      'Z',
    ].join(' ');
  };

  return (
    <g
      className={[sway && 'ci-plant', sway, faded && 'ci-far'].filter(Boolean).join(' ')}
      style={sway ? { animationDelay: delay } : undefined}
    >
      <path className="ci-stem" d={curve(base, ctrl, tip)} />
      <path className="ci-blade" d={blade(0.3, 1, 46 * size)} />
      <path className="ci-blade" d={blade(0.52, -1, 38 * size)} />
      {tuft && <Tuft x={x} y={baseY} scale={size} />}
      <path className="ci-rachis" d={curve(tip, droopCtrl, droopTip)} />
      {seedsAlong(base, ctrl, tip, near ? 5 : 3, 0.74, size * 0.8).map((s, i) => (
        <Grain key={`u${i}`} {...s} awn={near} />
      ))}
      {seedsAlong(tip, droopCtrl, droopTip, near ? 9 : 5, 0.04, size).map((s, i) => (
        <Grain key={`d${i}`} {...s} awn={near} />
      ))}
    </g>
  );
}

/** A mungbean leaflet, drawn pointing right from its petiole at the origin. */
const LEAFLET = 'M0 -1 C8 -19 27 -25 41 -8 C28 7 8 9 0 -1 Z';
const LEAFLET_RIB = 'M3 -2 C15 -9 29 -11 38 -8';

function Leaflet({ rot, scale, delay }: { rot: number; scale: number; delay: string }) {
  return (
    <g transform={`rotate(${rot}) scale(${scale})`}>
      <g className="ci-flutter" style={{ animationDelay: delay }}>
        <path className="ci-leaf" d={LEAFLET} />
        <path className="ci-rib" d={LEAFLET_RIB} />
      </g>
    </g>
  );
}

/** Three leaflets to a stalk — mungbean is trifoliate, and it shows. */
function Trifoliate({
  x,
  y,
  scale,
  tilt = 0,
  flip = false,
  delay,
}: {
  x: number;
  y: number;
  scale: number;
  tilt?: number;
  flip?: boolean;
  delay: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})${flip ? ' scale(-1 1)' : ''}`}>
      <Leaflet rot={-38} scale={scale * 0.82} delay={delay} />
      <Leaflet rot={-4} scale={scale} delay={`calc(${delay} + 0.6s)`} />
      <Leaflet rot={34} scale={scale * 0.86} delay={`calc(${delay} + 1.2s)`} />
    </g>
  );
}

/** A pod hanging from a node, beans showing through the wall. */
const POD: [Pt, Pt, Pt] = [
  [0, 0],
  [7, 16],
  [4, 37],
];

function Pod({
  x,
  y,
  rot,
  scale = 1,
  ripe = false,
  delay,
}: {
  x: number;
  y: number;
  rot: number;
  scale?: number;
  ripe?: boolean;
  delay: string;
}) {
  const wall = `M${POD[0][0]} ${POD[0][1]} Q${POD[1][0]} ${POD[1][1]} ${POD[2][0]} ${POD[2][1]}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="ci-swing" style={{ animationDelay: delay }}>
        <g transform={`rotate(${rot}) scale(${scale})`}>
          {/* A wider stroke underneath stands in for an outline, which keeps the
              pods off the leaves they hang against. */}
          <path className="ci-pod-edge" d={wall} />
          <path className={ripe ? 'ci-pod ci-pod--ripe' : 'ci-pod'} d={wall} />
          {[0.14, 0.32, 0.5, 0.68, 0.86].map((t) => {
            const [bx, by] = pointAt(POD[0], POD[1], POD[2], t);
            return <circle key={t} className="ci-bean-mark" cx={bx} cy={by} r="1.4" />;
          })}
          <path className="ci-pod-tip" d="M4 37 L5.4 41" />
        </g>
      </g>
    </g>
  );
}

/**
 * The mungbean plant: a low bush, not a spindle. The pod raceme hangs out to the
 * left where nothing competes with it, because the pods are the whole point of
 * putting mungbean in the picture at all.
 */
function Mungbean({ x, delay }: { x: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${BASE_Y})`}>
      <g className="ci-plant ci-sway-slow" style={{ animationDelay: delay }}>
        <path className="ci-stem ci-stem--mung" d="M0 0 C-3 -30 4 -70 -4 -100" />
        <path className="ci-stem ci-stem--mung ci-stem--thin" d="M0 -58 C12 -62 24 -61 36 -58" />
        <Trifoliate x={-4} y={-100} scale={0.72} tilt={-20} delay="0s" />
        <Trifoliate x={2} y={-78} scale={0.84} tilt={16} flip delay="1.4s" />
        <Trifoliate x={-5} y={-52} scale={0.66} tilt={-4} flip delay="2.6s" />
        {/* Three pods off one raceme. A pod bends to its right, so the rotations
            have to fan outwards from the middle or the pods cross into one lump. */}
        <Pod x={17} y={-60} rot={28} scale={0.78} delay="0.2s" />
        <Pod x={29} y={-63} rot={0} scale={0.88} ripe delay="1.3s" />
        <Pod x={41} y={-59} rot={-28} scale={0.78} delay="2.1s" />
        {/* Shelled beans on the soil — the state most people actually see them in. */}
        <g className="ci-fallen">
          <circle className="ci-bean" cx="-30" cy="-4" r="4.4" />
          <circle className="ci-bean-gloss" cx="-31.4" cy="-5.4" r="1.3" />
          <circle className="ci-bean" cx="-19" cy="-2.6" r="3.7" />
          <circle className="ci-bean-gloss" cx="-20.2" cy="-3.8" r="1.1" />
          <circle className="ci-bean" cx="-8" cy="-3.6" r="4" />
          <circle className="ci-bean-gloss" cx="-9.2" cy="-4.9" r="1.2" />
        </g>
      </g>
    </g>
  );
}

/** The far side of the paddy, drawn small and pale so it stays scenery. */
const FIELD = Array.from({ length: 8 }, (_, i) => ({
  x: 84 + i * 33,
  baseY: 252 + (i % 3) * 5,
  height: 26 + (i % 4) * 4,
  lean: i % 2 === 0 ? 5 : -5,
}));

/** Chaff lifting off the field — the one bit of motion that leaves the ground. */
const MOTES = [
  { x: 128, y: 250, s: 0.7, delay: '0s', dur: '11s' },
  { x: 196, y: 236, s: 0.55, delay: '2.4s', dur: '13s' },
  { x: 252, y: 258, s: 0.75, delay: '4.1s', dur: '10s' },
  { x: 300, y: 240, s: 0.5, delay: '6.3s', dur: '14s' },
  { x: 162, y: 262, s: 0.6, delay: '8.2s', dur: '12s' },
  { x: 272, y: 228, s: 0.45, delay: '9.6s', dur: '15s' },
];

export default function CropArt() {
  return (
    <div className="hhero-art" aria-hidden="true">
      <svg viewBox="0 0 400 340" role="presentation" focusable="false">
        <defs>
          <linearGradient id="ci-sky" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#eaf3fb" />
            <stop offset="0.55" stopColor="#f4f9fb" />
            <stop offset="1" stopColor="#fdf8ec" />
          </linearGradient>
          <radialGradient id="ci-sun">
            <stop offset="0" stopColor="#ffe9a8" />
            <stop offset="0.6" stopColor="#ffd977" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffd977" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ci-paddy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bcd8b4" />
            <stop offset="1" stopColor="#8fbf94" />
          </linearGradient>
          <linearGradient id="ci-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9db3c4" />
            <stop offset="1" stopColor="#b9cbd6" />
          </linearGradient>
          <linearGradient id="ci-grain" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2d288" />
            <stop offset="1" stopColor="#c48f2c" />
          </linearGradient>
          <linearGradient id="ci-leaf" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#6cb06c" />
            <stop offset="1" stopColor="#3c8250" />
          </linearGradient>
          <clipPath id="ci-disc">
            <circle cx="200" cy="152" r="134" />
          </clipPath>
        </defs>

        {/* The sky is a disc rather than a card, so the plants can grow out of it. */}
        <g clipPath="url(#ci-disc)">
          <rect x="60" y="12" width="280" height="292" fill="url(#ci-sky)" />
          <circle className="ci-sun" cx="272" cy="94" r="52" fill="url(#ci-sun)" />
          <circle className="ci-sun-core" cx="272" cy="94" r="17" />
          {/* Sierra Madre on one side, the Caraballos on the other. */}
          <path
            className="ci-ridge"
            fill="url(#ci-ridge)"
            d="M60 214 L96 182 L118 198 L152 164 L186 196 L214 176 L248 200 L288 172 L326 202 L340 194 L340 300 L60 300 Z"
          />
          <path
            className="ci-field"
            d="M60 226 C120 216 200 232 260 224 C300 219 324 226 340 222 L340 300 L60 300 Z"
          />
          <path
            className="ci-paddy"
            fill="url(#ci-paddy)"
            d="M60 244 C130 234 250 254 340 240 L340 300 L60 300 Z"
          />
          <g className="ci-rows">
            <path
              className="ci-row"
              style={{ animationDelay: '0s' }}
              d="M62 258 C140 250 250 266 338 254"
            />
            <path
              className="ci-row"
              style={{ animationDelay: '1.6s' }}
              d="M62 272 C140 266 250 280 338 268"
            />
            <path
              className="ci-row"
              style={{ animationDelay: '3.2s' }}
              d="M62 288 C140 282 250 294 338 284"
            />
          </g>
          {/* The far side of the paddy: one group, one animation, so a row of
              crop costs about as much to animate as a single plant. */}
          <g className="ci-plant ci-sway-far">
            {FIELD.map((f) => (
              <RiceStalk
                key={f.x}
                x={f.x}
                baseY={f.baseY}
                height={f.height}
                lean={f.lean}
                size={0.34}
                tuft={false}
                detail="far"
                faded
              />
            ))}
          </g>
          <g className="ci-birds">
            <g transform="translate(94 106)">
              <path
                className="ci-bird"
                d="M0 0 q4 -4 8 0 q4 -4 8 0"
                style={{ animationDelay: '0s' }}
              />
            </g>
            <g transform="translate(118 130)">
              <path
                className="ci-bird"
                d="M0 0 q3 -3 6 0 q3 -3 6 0"
                style={{ animationDelay: '5.5s' }}
              />
            </g>
          </g>
        </g>

        <ellipse className="ci-ground" cx="200" cy="302" rx="128" ry="9" />
        <circle className="ci-disc-ring" cx="200" cy="152" r="134" />

        <Mungbean x={122} delay="-2s" />
        <RiceStalk x={214} height={214} lean={16} size={1} sway="ci-sway-a" delay="0s" />
        <RiceStalk x={246} height={182} lean={26} size={0.88} sway="ci-sway-b" delay="-2.1s" />
        <RiceStalk x={192} height={158} lean={-22} size={0.8} sway="ci-sway-c" delay="-4.4s" />

        {MOTES.map((m) => (
          <ellipse
            key={`${m.x}-${m.y}`}
            className="ci-mote"
            cx={m.x}
            cy={m.y}
            rx={2.2 * m.s}
            ry={4.4 * m.s}
            style={{ animationDelay: m.delay, animationDuration: m.dur }}
          />
        ))}
      </svg>
    </div>
  );
}
