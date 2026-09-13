
/**
 * Project previews are drafted diagrams, not mock screenshots.
 *
 * A fake dashboard would be a lie about what these systems look like; a
 * schematic is honest about what they *are*. Each one is drawn on the same
 * grid, with the same hairline weight and the same corner registration marks,
 * so the three read as plates from one technical document.
 */

const STROKE = "stroke-ink/25";
const STROKE_STRONG = "stroke-ink/70";
const FILL_SOFT = "fill-ink/[0.045]";

function Frame({
  children,
  code,
  className = "max-w-[38rem]",
}: {
  children: React.ReactNode;
  code: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 330"
      fill="none"
      aria-hidden="true"
      className={`w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Registration ticks — the plate's corners */}
      <g className={STROKE} strokeWidth="1">
        <path d="M24 14v10M14 24h10M456 14v10M466 24h-10M24 316v-10M14 306h10M456 316v-10M466 306h-10" />
      </g>
      <text
        x="24"
        y="312"
        className="fill-ink/30 font-mono"
        fontSize="9"
        letterSpacing="1.4"
      >
        {code}
      </text>
      {children}
    </svg>
  );
}

/** SehatConnect — reach: one service, three very different access paths. */
function SehatDiagram({ className }: { className?: string }) {
  return (
    <Frame code="FIG. 01 — ACCESS PATHS" className={className}>
      {/* Feature phone — the path that matters most */}
      <g>
        <rect
          x="52"
          y="96"
          width="74"
          height="122"
          rx="8"
          className={`${STROKE_STRONG} ${FILL_SOFT}`}
          strokeWidth="1.25"
        />
        <path d="M52 184h74" className={STROKE} strokeWidth="1" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle
              key={`${r}-${c}`}
              cx={70 + c * 19}
              cy={194 + r * 8}
              r="2.1"
              className="fill-ink/35"
            />
          )),
        )}
        <path
          d="M64 110h50M64 122h34M64 134h42"
          className={STROKE}
          strokeWidth="1"
        />
        <text x="52" y="238" className="fill-ink/45 font-mono" fontSize="8.5" letterSpacing="1.2">
          IVR / VOICE
        </text>
      </g>

      {/* Signal arcs — concentric, opening toward the service */}
      <g className={STROKE} strokeWidth="1" strokeLinecap="round">
        <path d="M136 130a14 14 0 0 1 0 18" />
        <path d="M144 123a25 25 0 0 1 0 32" />
        <path d="M152 116a36 36 0 0 1 0 46" />
      </g>

      {/* Service core */}
      <g>
        <rect
          x="186"
          y="118"
          width="108"
          height="82"
          rx="4"
          className={STROKE_STRONG}
          strokeWidth="1.25"
        />
        <path d="M186 142h108" className={STROKE} strokeWidth="1" />
        <text x="196" y="136" className="fill-ink/70 font-mono" fontSize="9" letterSpacing="1.2">
          NODE.JS
        </text>
        <path d="M198 158h60M198 170h84M198 182h48" className={STROKE} strokeWidth="1" />
      </g>

      {/* Store */}
      <g className={STROKE_STRONG} strokeWidth="1.25">
        <ellipse cx="240" cy="242" rx="30" ry="8" />
        <path d="M210 242v22c0 4.4 13.4 8 30 8s30-3.6 30-8v-22" />
      </g>
      <path d="M240 200v34" className={STROKE} strokeWidth="1" strokeDasharray="3 3" />
      <text x="212" y="290" className="fill-ink/45 font-mono" fontSize="8.5" letterSpacing="1.2">
        MONGODB
      </text>

      {/* Link into the core */}
      <path d="M160 139h26" className={STROKE_STRONG} strokeWidth="1.25" />
      <path d="M294 159h28" className={STROKE_STRONG} strokeWidth="1.25" />

      {/* Smartphone client — on-device inference */}
      <g>
        <rect
          x="326"
          y="88"
          width="88"
          height="142"
          rx="10"
          className={`${STROKE_STRONG} ${FILL_SOFT}`}
          strokeWidth="1.25"
        />
        <rect x="358" y="96" width="24" height="3" rx="1.5" className="fill-ink/25" />
        <rect
          x="340"
          y="112"
          width="60"
          height="40"
          rx="3"
          className={STROKE}
          strokeWidth="1"
        />
        <path d="M340 168h60M340 180h40M340 192h52" className={STROKE} strokeWidth="1" />
        {/* On-device inference: three nodes, wired */}
        <g className={STROKE_STRONG} strokeWidth="1.1">
          <path d="M358 124 372 132 358 140 358 124M372 132h10" />
        </g>
        <circle cx="357" cy="124" r="2.6" className="fill-ink/70" />
        <circle cx="357" cy="140" r="2.6" className="fill-ink/70" />
        <circle cx="384" cy="132" r="2.6" className="fill-ink/70" />
        <text x="326" y="250" className="fill-ink/45 font-mono" fontSize="8.5" letterSpacing="1.2">
          TFLITE · WEBRTC
        </text>
      </g>
    </Frame>
  );
}

/** VyaparIQ — microservices and caching diagram. */
function VyaparIQDiagram({ className }: { className?: string }) {
  const nodes = [
    { x: 46, label: "CLIENT" },
    { x: 140, label: "EXPRESS" },
    { x: 234, label: "FASTAPI" },
    { x: 328, label: "GEMINI" },
  ];

  return (
    <Frame code="FIG. 02 — E-COMMERCE ARCHITECTURE" className={className}>
      {/* DB feeding Express */}
      <g>
        <rect x="110" y="58" width="86" height="40" rx="3" className={STROKE} strokeWidth="1" />
        <text x="118" y="76" className="fill-ink/45 font-mono" fontSize="8" letterSpacing="1.1">
          POSTGRESQL
        </text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle
            key={i}
            cx={120 + (i % 4) * 17}
            cy={86 + Math.floor(i / 4) * 7}
            r="1.8"
            className="fill-ink/30"
          />
        ))}
        <path d="M153 98v28" className={STROKE} strokeWidth="1" strokeDasharray="3 3" />
      </g>

      {/* Main chain */}
      {nodes.map((n, i) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y="126"
            width="76"
            height="42"
            rx="3"
            className={`${i === 2 ? STROKE_STRONG : STROKE} ${i === 2 ? FILL_SOFT : ""}`}
            strokeWidth={i === 2 ? 1.4 : 1.1}
          />
          <text
            x={n.x + 10}
            y="152"
            className={i === 2 ? "fill-ink/80 font-mono" : "fill-ink/55 font-mono"}
            fontSize="8.5"
            letterSpacing="1.2"
          >
            {n.label}
          </text>
          {i < nodes.length - 1 ? (
            <g className={STROKE_STRONG} strokeWidth="1.25">
              <path d={`M${n.x + 76} 147h12`} />
              <path d={`M${n.x + 84} 143.5 ${n.x + 88} 147 ${n.x + 84} 150.5`} />
            </g>
          ) : null}
        </g>
      ))}

      {/* Output */}
      <g className={STROKE_STRONG} strokeWidth="1.25">
        <path d="M404 147h26" />
        <path d="M426 143.5 430 147l-4 3.5" />
      </g>
      <text x="404" y="176" className="fill-ink/45 font-mono" fontSize="8" letterSpacing="1.1">
        RESPONSE
      </text>

      {/* Cache branch */}
      <g>
        <path
          d="M272 168v46h-92"
          className={STROKE}
          strokeWidth="1.1"
          strokeDasharray="4 4"
        />
        <path d="M186 210.5 180 214l6 3.5" className={STROKE} strokeWidth="1.1" />
        <rect x="94" y="196" width="86" height="36" rx="3" className={STROKE} strokeWidth="1.1" />
        <text x="114" y="218" className="fill-ink/55 font-mono" fontSize="8.5" letterSpacing="1.2">
          REDIS
        </text>
      </g>
    </Frame>
  );
}

/** File Intelligence — meaning-ranked results, all of it local. */
function FileIntDiagram({ className }: { className?: string }) {
  const rows = [0.86, 0.71, 0.58, 0.41, 0.29];

  return (
    <Frame code="FIG. 03 — LOCAL SEMANTIC INDEX" className={className}>
      {/* Query field */}
      <g>
        <rect x="46" y="58" width="240" height="34" rx="17" className={STROKE_STRONG} strokeWidth="1.25" />
        <circle cx="70" cy="75" r="6" className={STROKE_STRONG} strokeWidth="1.25" />
        <path d="M74.5 79.5 79 84" className={STROKE_STRONG} strokeWidth="1.25" />
        <path d="M90 75h84" className={STROKE} strokeWidth="1.5" />
        <path d="M180 66v18" className={STROKE_STRONG} strokeWidth="1.25" />
      </g>

      {/* Boundary: nothing crosses it */}
      <g>
        <rect
          x="30"
          y="40"
          width="420"
          height="242"
          rx="6"
          className={STROKE}
          strokeWidth="1"
          strokeDasharray="5 5"
        />
        <text x="330" y="56" className="fill-ink/40 font-mono" fontSize="8" letterSpacing="1.2">
          LOCAL BOUNDARY
        </text>
      </g>

      {/* Embedding cluster */}
      <g>
        <rect x="316" y="66" width="118" height="94" rx="3" className={STROKE} strokeWidth="1" />
        {[
          [24, 20], [46, 34], [70, 22], [92, 40], [34, 52], [58, 60],
          [82, 70], [104, 56], [20, 74], [48, 80], [70, 46], [98, 82],
        ].map(([dx, dy], i) => (
          <circle
            key={i}
            cx={316 + dx}
            cy={66 + dy}
            r={i % 4 === 0 ? "3" : "2"}
            className={i % 4 === 0 ? "fill-ink/65" : "fill-ink/25"}
          />
        ))}
        <text x="316" y="176" className="fill-ink/45 font-mono" fontSize="8" letterSpacing="1.1">
          EMBEDDING SPACE
        </text>
      </g>

      {/* Ranked results */}
      <g>
        {rows.map((score, i) => {
          const y = 118 + i * 30;
          return (
            <g key={i}>
              <path d={`M46 ${y + 20}h240`} className={STROKE} strokeWidth="1" />
              <rect
                x="46"
                y={y}
                width="13"
                height="15"
                rx="1.5"
                className={i === 0 ? STROKE_STRONG : STROKE}
                strokeWidth="1.1"
              />
              <path
                d={`M70 ${y + 7}h${40 + i * 11}`}
                className={i === 0 ? "stroke-ink/70" : "stroke-ink/30"}
                strokeWidth="1.5"
              />
              <rect
                x="196"
                y={y + 4}
                width="66"
                height="4"
                rx="2"
                className="fill-ink/10"
              />
              <rect
                x="196"
                y={y + 4}
                width={66 * score}
                height="4"
                rx="2"
                className={i === 0 ? "fill-ink/75" : "fill-ink/30"}
              />
              <text
                x="270"
                y={y + 9}
                className="fill-ink/35 font-mono"
                fontSize="7.5"
              >
                {score.toFixed(2)}
              </text>
            </g>
          );
        })}
      </g>

      {/* Runtime */}
      <text x="316" y="206" className="fill-ink/45 font-mono" fontSize="8" letterSpacing="1.1">
        OLLAMA · CHROMADB
      </text>
      <path d="M316 214h118" className={STROKE} strokeWidth="1" />
      <path d="M316 226h78" className={STROKE} strokeWidth="1" />
      <path d="M316 238h96" className={STROKE} strokeWidth="1" />
    </Frame>
  );
}

export type DiagramKey = "sehat" | "vyapariq" | "fileint";

export function ProjectVisual({
  variant,
  size = "card",
}: {
  variant: DiagramKey;
  /** "plate" is the full-width figure on a case-study page. */
  size?: "card" | "plate";
}) {
  const cls = size === "plate" ? "max-w-[52rem]" : "max-w-[38rem]";
  if (variant === "sehat") return <SehatDiagram className={cls} />;
  if (variant === "vyapariq") return <VyaparIQDiagram className={cls} />;
  return <FileIntDiagram className={cls} />;
}
