export type CaptureMeta = {
  title: string;
  note: string;
  formation: string;
  material: string;
  valueCount: number;
  maximum: number;
};

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/png";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const fontCache = new Map<string, string>();

function resolveFont(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const cached = fontCache.get(variable);
  if (cached) return cached;
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.fontFamily = `var(${variable})`;
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || fallback;
  probe.remove();
  fontCache.set(variable, family);
  return family;
}

function setLetterSpacing(
  context: CanvasRenderingContext2D,
  value: string,
) {
  if ("letterSpacing" in context) {
    (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      value;
  }
}

function monoLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = "left",
) {
  context.save();
  context.font = `400 ${size}px ${resolveFont("--lab-font-mono", "monospace")}`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = "alphabetic";
  setLetterSpacing(context, `${Math.round(size * 0.07)}px`);
  context.fillText(text, x, y);
  context.restore();
}

/**
 * A real poster composition around the captured 3D frame. No external image
 * services and no fabricated data: every line is read from the live dataset.
 */
export async function composePoster(
  sculptureImage: HTMLImageElement,
  meta: CaptureMeta,
): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const width = 2000;
  const height = 2500;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The poster canvas could not be created.");

  const ivory = "#efece2";
  const ink = "#252620";
  const acid = "#e5e94b";
  const muted = "#6b675c";
  const displayFont = resolveFont("--lab-font-display", "serif");
  const sansFont = resolveFont("--lab-font-sans", "sans-serif");

  context.fillStyle = ivory;
  context.fillRect(0, 0, width, height);

  const imageTop = 120;
  const imageMargin = 120;
  const imageWidth = width - imageMargin * 2;
  const imageHeight = 1650;
  context.save();
  context.beginPath();
  context.rect(imageMargin, imageTop, imageWidth, imageHeight);
  context.clip();
  const scale = Math.max(
    imageWidth / sculptureImage.width,
    imageHeight / sculptureImage.height,
  );
  const drawWidth = sculptureImage.width * scale;
  const drawHeight = sculptureImage.height * scale;
  context.drawImage(
    sculptureImage,
    imageMargin + (imageWidth - drawWidth) / 2,
    imageTop + (imageHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();

  monoLabel(
    context,
    "LAB/  ·  A STUDY IN TANGIBLE INFORMATION",
    imageMargin,
    88,
    24,
    muted,
  );
  context.fillStyle = acid;
  context.fillRect(imageMargin, 52, 34, 6);
  monoLabel(
    context,
    "DATA MATTER",
    width - imageMargin,
    88,
    24,
    ink,
    "right",
  );

  context.strokeStyle = "rgba(37, 38, 32, 0.18)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(imageMargin, 1810);
  context.lineTo(width - imageMargin, 1810);
  context.stroke();

  context.fillStyle = ink;
  context.font = `700 92px ${displayFont}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  setLetterSpacing(context, "-2px");
  context.fillText(meta.title, imageMargin, 1940, imageWidth);

  monoLabel(
    context,
    `${meta.formation.toUpperCase()}  ·  ${meta.material.toUpperCase()}`,
    imageMargin,
    2005,
    26,
    "#7e8410",
  );

  context.font = `400 27px ${sansFont}`;
  context.fillStyle = muted;
  setLetterSpacing(context, "0px");
  context.fillText(meta.note, imageMargin, 2072, imageWidth);

  const statY = 2210;
  monoLabel(context, "VALUES", imageMargin, statY, 20, muted);
  context.fillStyle = ink;
  context.font = `500 44px ${sansFont}`;
  setLetterSpacing(context, "0px");
  context.fillText(String(meta.valueCount), imageMargin, statY + 52);

  const secondX = imageMargin + 330;
  monoLabel(context, "MAXIMUM", secondX, statY, 20, muted);
  context.fillStyle = ink;
  context.font = `500 44px ${sansFont}`;
  context.fillText(String(meta.maximum), secondX, statY + 52);

  const thirdX = imageMargin + 720;
  monoLabel(context, "ENCODING", thirdX, statY, 20, muted);
  context.fillStyle = ink;
  context.font = `400 27px ${sansFont}`;
  context.fillText("Height and radius follow value ÷ maximum.", thirdX, statY + 42);

  context.strokeStyle = "rgba(37, 38, 32, 0.18)";
  context.beginPath();
  context.moveTo(imageMargin, 2352);
  context.lineTo(width - imageMargin, 2352);
  context.stroke();

  monoLabel(
    context,
    "ILLUSTRATIVE DATASET UNLESS REPLACED BY YOUR OWN",
    imageMargin,
    2412,
    18,
    muted,
  );
  monoLabel(
    context,
    "LAB.TANISHK.ME/PLAY/DATA-MATTER",
    width - imageMargin,
    2412,
    18,
    ink,
    "right",
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Poster export failed."))),
      "image/png",
    );
  });
}

/** A quiet gallery frame around the exact captured sculpture. */
export async function composeCleanPng(
  sculptureImage: HTMLImageElement,
  meta: CaptureMeta,
): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const width = 2400;
  const height = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The image canvas could not be created.");

  context.fillStyle = "#efece2";
  context.fillRect(0, 0, width, height);
  context.drawImage(sculptureImage, 0, 0, width, height);

  context.fillStyle = "#e5e94b";
  context.fillRect(90, height - 98, 30, 5);
  monoLabel(
    context,
    `DATA MATTER  ·  ${meta.formation.toUpperCase()} / ${meta.material.toUpperCase()}`,
    90,
    height - 76,
    22,
    "#3a372f",
  );
  monoLabel(
    context,
    "LAB/",
    width - 90,
    height - 76,
    22,
    "#252620",
    "right",
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image export failed."))),
      "image/png",
    );
  });
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The captured image could not be read."));
    image.src = dataUrl;
  });
}
