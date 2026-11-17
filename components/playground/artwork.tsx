import {
  DEFAULT_RECIPE,
  recipeShapes,
  SAMPLE_DATA,
  type Datum,
  type Recipe,
} from "@/lib/playground/math";
export function DataSculpture({
  data = SAMPLE_DATA,
  height = 160,
  angle = 0,
  wire = false,
}: {
  data?: Datum[];
  height?: number;
  angle?: number;
  wire?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <svg
      viewBox="0 0 900 560"
      fill="none"
      role="img"
      aria-label={`Data sculpture. ${data.map((d) => `${d.label}: ${d.value}`).join(", ")}. Ridge heights are proportional to values.`}
    >
      <g transform={`translate(450 320) rotate(${angle}) translate(-450 -320)`}>
        <path
          d="M140 400 430 510 790 330 500 225Z"
          stroke="currentColor"
          opacity=".2"
        />
        {Array.from({ length: 47 }, (_, row) => {
          const t = 1 - row / 46;
          const x0 = 145 + t * 345,
            y0 = 398 - t * 158;
          const points = Array.from({ length: 121 }, (_, i) => {
            const u = i / 120;
            const at = u * (data.length - 1);
            const a = Math.floor(at),
              b = Math.min(data.length - 1, a + 1);
            const f = at - a;
            const smooth = f * f * (3 - 2 * f);
            const value =
              (data[a].value * (1 - smooth) + data[b].value * smooth) / max;
            const envelope = Math.sin(Math.PI * t) * 0.75 + 0.25;
            return `${(x0 + u * 300).toFixed(2)},${(y0 + u * 110 - value * height * envelope).toFixed(2)}`;
          });
          return (
            <polyline
              key={row}
              points={`${x0},${y0} ${points.join(" ")} ${x0 + 300},${y0 + 110}`}
              fill={wire ? "none" : "var(--sculpture-fill, #e7e8e4)"}
              stroke="currentColor"
              strokeWidth="1.1"
            />
          );
        })}
      </g>
    </svg>
  );
}
export function VectorArtwork({
  recipe = DEFAULT_RECIPE,
}: {
  recipe?: Recipe;
}) {
  return (
    <svg
      viewBox="0 0 600 600"
      role="img"
      aria-label={`${recipe.kind} pattern with ${recipe.count} shapes, ${recipe.twist} degree divergence`}
    >
      <rect width="600" height="600" fill={recipe.paper} />
      <g fill="none" stroke={recipe.ink} strokeWidth="1.2">
        {recipeShapes(recipe).map((s, i) => (
          <g
            key={i}
            transform={`translate(${s.x} ${s.y}) rotate(${s.rotation})`}
          >
            {recipe.kind === "orbit" ? (
              <circle r={s.size} />
            ) : recipe.kind === "ribbon" ? (
              <rect x={-s.size} y="-5" width={s.size * 2} height="10" rx="5" />
            ) : (
              <path d={s.d} transform={`scale(${s.size / 30})`} />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}
export function Rosette() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        {Array.from({ length: 36 }, (_, i) => (
          <ellipse
            key={i}
            cx="200"
            cy="200"
            rx="68"
            ry="162"
            transform={`rotate(${i * 5} 200 200)`}
          />
        ))}
      </g>
    </svg>
  );
}
export function TerrariumArtwork() {
  return (
    <svg viewBox="0 0 900 500" aria-hidden="true">
      <g stroke="#476544" fill="none" strokeWidth="2">
        {Array.from({ length: 25 }, (_, i) => {
          const x = 30 + i * 35,
            h = 65 + Math.sin(i * 7) * 35;
          return (
            <g key={i}>
              <path d={`M${x} 500Q${x + 20} ${470 - h} ${x - 5} ${420 - h}`} />
              <ellipse
                cx={x - 6}
                cy={420 - h}
                rx="12"
                ry="24"
                transform={`rotate(-30 ${x - 6} ${420 - h})`}
                fill="#b6ca81"
              />
            </g>
          );
        })}
      </g>
      {[180, 480, 700].map((x, i) => (
        <g key={x} transform={`translate(${x} ${300 + (i % 2) * 65})`}>
          <path
            d="M-12 120Q-5 55 6 0L22 0Q12 60 25 120"
            fill="#f0edc2"
            stroke="#808b5c"
          />
          <path
            d="M-95 10C-80-110 80-110 95 10Q0 50-95 10"
            fill={i === 1 ? "#7354b6" : "#f37959"}
          />
          <path
            d="M-80 10Q0-20 80 10"
            fill="none"
            stroke="#252620"
            opacity=".4"
          />
          {[-40, -10, 30, 55].map((cx, j) => (
            <ellipse
              key={cx}
              cx={cx}
              cy={-15 - (j % 2) * 18}
              rx="7"
              ry="4"
              fill="#f7efcf"
            />
          ))}
        </g>
      ))}
      <g fill="#57406e">
        {[120, 370, 580, 800].map((x, i) => (
          <g key={x} transform={`translate(${x} ${440 - (i % 2) * 28})`}>
            <path d="M-18 12Q-24-25 0-24Q24-25 18 12Z" />
            <path d="m-8 12-6 10m20-10 6 10" stroke="#57406e" strokeWidth="3" />
            <circle cx="-7" cy="-7" r="3" fill="#fff7dd" />
            <circle cx="7" cy="-7" r="3" fill="#fff7dd" />
          </g>
        ))}
      </g>
    </svg>
  );
}
export function GenomeArtwork() {
  return (
    <div className="genome-art" aria-hidden="true">
      <div className="genome-art-nav">
        <b>FIELD NOTES</b>
        <span>Read · Listen · Collect</span>
      </div>
      <div className="genome-art-body">
        <strong>
          Ideas grow
          <br />
          in the gaps.
        </strong>
        <div className="genome-art-orb" />
      </div>
      <div className="genome-art-lines">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
export function MotionArtwork() {
  return (
    <div className="motion-art" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            left: `${15 + i * 14}%`,
            opacity: 0.2 + i * 0.2,
            transform: `translateY(${Math.sin(i * 1.3) * 70}px) rotate(${i * 15}deg)`,
          }}
        />
      ))}
    </div>
  );
}
export function ProjectArtwork({ slug }: { slug: string }) {
  if (slug === "data-matter") return <DataSculpture />;
  if (slug === "vector-kitchen") return <VectorArtwork />;
  if (slug === "browser-terrarium") return <TerrariumArtwork />;
  if (slug === "type-has-mass")
    return (
      <div className="mass-art" aria-hidden="true">
        <span>H</span>
        <span>E</span>
        <span>A</span>
        <span>V</span>
        <span>Y</span>
        <small>PLEASE HANDLE WITH FEELING.</small>
      </div>
    );
  if (slug === "interface-genome") return <GenomeArtwork />;
  if (slug === "motion-foundry") return <MotionArtwork />;
  return (
    <div className="click-art" aria-hidden="true">
      <span>
        Just one
        <br />
        <em>more.</em>
      </span>
      <div>
        Accept everything <IconArrow />
      </div>
    </div>
  );
}
function IconArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path
        d="M3 12h17m-7-6 7 6-7 6"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
}
