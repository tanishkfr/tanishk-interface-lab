import Image from "next/image";
import {
  DEFAULT_RECIPE,
  recipeShapes,
  type Recipe,
} from "@/lib/playground/math";

export function DataSculpture() {
  return (
    <Image
      className="data-sculpture-preview"
      src="/images/data-matter-terrain-strata.webp"
      alt=""
      width={2000}
      height={1250}
      sizes="(max-width: 650px) 92vw, (max-width: 1100px) 44vw, (min-width: 1440px) 875px, 62vw"
      loading="eager"
    />
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
            transform={`translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.rotation.toFixed(2)})`}
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
  if (slug === "text-desk")
    return (
      <div className="text-desk-art" aria-hidden="true">
        <span>too &nbsp; much &nbsp; space.</span>
        <i>↓</i>
        <strong>A little clarity.</strong>
        <small>PASTE / CLEAN / KEEP</small>
      </div>
    );
  if (slug === "sticker-city")
    return (
      <svg viewBox="0 0 900 500" aria-hidden="true">
        <defs>
          <pattern
            id="sticker-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path d="M32 0H0V32" stroke="#252620" opacity=".12" fill="none" />
          </pattern>
        </defs>
        <rect width="900" height="500" fill="url(#sticker-grid)" />
        <g transform="translate(280 230) rotate(-12)">
          <path
            d="M0-145 30-110 82-123 91-70 142-48 115 0 142 48 91 70 82 123 30 110 0 145-30 110-82 123-91 70-142 48-115 0-142-48-91-70-82-123-30-110Z"
            fill="#e5e94b"
            stroke="#fff"
            strokeWidth="10"
          />
          <text
            textAnchor="middle"
            y="-8"
            fill="#252620"
            fontSize="45"
            fontWeight="900"
          >
            MAKE A
          </text>
          <text
            textAnchor="middle"
            y="40"
            fill="#252620"
            fontSize="54"
            fontWeight="900"
          >
            MESS.
          </text>
        </g>
        <g transform="translate(610 180) rotate(13)">
          <rect
            x="-170"
            y="-58"
            width="340"
            height="116"
            rx="6"
            fill="#f96851"
            stroke="#fff"
            strokeWidth="9"
          />
          <text
            textAnchor="middle"
            y="18"
            fontSize="46"
            fontWeight="900"
            fill="#252620"
          >
            NO PLAN.
          </text>
        </g>
        <g transform="translate(575 355) rotate(-8)">
          <ellipse
            rx="150"
            ry="90"
            fill="#5135d1"
            stroke="#fff"
            strokeWidth="9"
          />
          <text
            textAnchor="middle"
            y="15"
            fontSize="42"
            fontWeight="900"
            fill="#fff"
          >
            ALL PLAY.
          </text>
        </g>
      </svg>
    );
  if (slug === "almost-nothing")
    return (
      <svg viewBox="0 0 900 500" aria-hidden="true">
        <path
          d="M235 275C270 270 290 180 345 204S380 335 445 279 510 197 535 225 572 277 615 245"
          stroke="#252620"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="615" cy="245" r="3" fill="#252620" />
        <text x="450" y="425" textAnchor="middle" fontSize="16" fill="#65665d">
          You can leave it here.
        </text>
      </svg>
    );
  if (slug === "grid-crimes")
    return (
      <svg viewBox="0 0 900 500" aria-hidden="true">
        <path
          d="M50 0V500M450 0V500M850 0V500M0 85H900M0 405H900"
          stroke="#c1b9ab"
          strokeWidth="1"
        />
        <g transform="rotate(-4 450 250)">
          <text x="75" y="200" fontSize="128" fontWeight="900" fill="#252620">
            GOOD THINGS
          </text>
          <text x="75" y="310" fontSize="128" fontWeight="900" fill="#252620">
            OFF-GRID.
          </text>
        </g>
        <rect
          x="596"
          y="307"
          width="200"
          height="140"
          fill="#ee674c"
          transform="rotate(12 696 377)"
        />
        <circle cx="696" cy="377" r="48" fill="#cddc79" stroke="#252620" />
      </svg>
    );
  if (slug === "brutal-exe")
    return (
      <div className="brutal-art" aria-hidden="true">
        <b>
          MAKE
          <br />
          NOISE.
        </b>
        <b>
          LEAVE
          <br />A TRACE.
        </b>
        <b>
          CHANGE
          <br />
          THE ORDER.
        </b>
        <b>
          TAKE THE
          <br />
          RECEIPT.
        </b>
      </div>
    );
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
