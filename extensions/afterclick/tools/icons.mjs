/**
 * Generate the AFTERCLICK icon set without an image dependency.
 * A tiny supersampled raster drawing is encoded as PNG with node:zlib.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist", "icons");

const INK = [18, 20, 16, 255];
const ACID = [220, 233, 75, 255];
const CORAL = [255, 116, 85, 255];
const BONE = [237, 234, 222, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuffer, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function png(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function draw(size) {
  const scale = 4;
  const w = size * scale;
  const h = size * scale;
  const pixels = Buffer.alloc(size * size * 4);
  const fill = (x0, y0, x1, y1, color) => {
    for (let y = Math.max(0, y0); y < Math.min(h, y1); y += 1) {
      for (let x = Math.max(0, x0); x < Math.min(w, x1); x += 1) {
        const i = (y * w + x) * 4;
        pixels[i] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
        pixels[i + 3] = color[3];
      }
    }
  };
  const u = (value) => Math.round((value / 100) * w);
  // Ground
  fill(0, 0, w, h, INK);
  // Recorder frame: a bracket open on the right, with three ticks.
  const inset = u(12);
  fill(inset, inset, inset + scale * 2, h - inset, ACID);
  fill(inset, inset, w - inset, inset + scale * 2, ACID);
  fill(inset, h - inset - scale * 2, w - inset, h - inset, ACID);
  fill(w - inset - scale * 2, inset, w - inset, u(38), ACID);
  fill(w - inset - scale * 2, u(62), w - inset, h - inset, ACID);
  // Timeline stem and consequence ticks.
  const stemX = u(34);
  fill(stemX, u(28), stemX + scale * 2, u(82), BONE);
  fill(stemX, u(35), u(58), u(35) + scale * 2, ACID);
  fill(stemX, u(55), u(66), u(55) + scale * 2, CORAL);
  fill(stemX, u(75), u(50), u(75) + scale * 2, BONE);
  // End marker
  fill(u(72), u(68), u(78), u(74), CORAL);

  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const i = ((y * scale + sy) * w + (x * scale + sx)) * 4;
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
          a += pixels[i + 3];
        }
      }
      const count = scale * scale;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / count);
      out[o + 1] = Math.round(g / count);
      out[o + 2] = Math.round(b / count);
      out[o + 3] = Math.round(a / count);
    }
  }
  return png(size, size, out);
}

await mkdir(outDir, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await writeFile(path.join(outDir, `icon-${size}.png`), draw(size));
}
console.log("AFTERCLICK/ icons written to dist/icons");
