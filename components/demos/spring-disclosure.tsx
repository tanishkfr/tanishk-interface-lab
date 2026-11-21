"use client";

import { useState } from "react";
import {
  SpringDisclosure,
  type DisclosureItem,
} from "@/components/lab/spring-disclosure/spring-disclosure";
import type { DemoProps } from "./demo-host";
import "./spring-disclosure-demo.css";

function CareForm() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState("");
  return (
    <div className="dm-sd-care">
      <p>
        Repairs are handled by independent workshops. Tell us where the lamp
        lives and we will show the nearest partners.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = postcode.trim().toUpperCase();
          if (!value) {
            setResult("Enter a postcode to find a partner.");
            return;
          }
          if (value.length < 4) {
            setResult("That postcode looks incomplete. Try four characters or more.");
            return;
          }
          setResult(`Two partner workshops cover ${value}. The nearest is 2.4 km away.`);
        }}
      >
        <label htmlFor="sd-postcode">Postcode</label>
        <div>
          <input
            id="sd-postcode"
            value={postcode}
            placeholder="e.g. EC2A"
            onChange={(event) => setPostcode(event.target.value)}
          />
          <button type="submit">Find a partner</button>
        </div>
      </form>
      <p className="dm-sd-care-result" role="status">
        {result || "No search yet."}
      </p>
    </div>
  );
}

function BoxList({ shade, setShade }: { shade: boolean; setShade: (value: boolean) => void }) {
  return (
    <div className="dm-sd-box">
      <ul>
        <li><span>01</span> Rove task lamp, assembled</li>
        <li><span>02</span> Linen shade, natural</li>
        <li><span>03</span> 2.4 m braided cable</li>
        <li><span>04</span> Care card and hex key</li>
      </ul>
      <label className="dm-sd-addon">
        <input
          type="checkbox"
          checked={shade}
          onChange={(event) => setShade(event.target.checked)}
        />
        <span>
          Add a second shade
          <small>Oat linen, +£18</small>
        </span>
      </label>
    </div>
  );
}

export default function SpringDisclosureDemo({ values }: DemoProps) {
  const mode = String(values.mode ?? "single") === "multiple" ? "multiple" : "single";
  const showDisabled = Boolean(values.disabled);
  const [quantity, setQuantity] = useState(1);
  const [shade, setShade] = useState(false);
  const [cart, setCart] = useState("");
  const price = 148 + (shade ? 18 : 0);

  const items: DisclosureItem[] = [
    {
      id: "overview",
      title: "Overview",
      summary: "A small lamp for a long table.",
      content: (
        <div className="dm-sd-prose">
          <p>
            Rove is a task light with a low centre of gravity and a shade that
            can be tilted by hand. The arm holds its position without a lock, so
            the light follows the work rather than the other way around.
          </p>
          <div className="dm-sd-facts">
            <span>Designed in Copenhagen</span>
            <span>Assembled in Portugal</span>
            <span>5 year repair promise</span>
          </div>
        </div>
      ),
    },
    {
      id: "box",
      title: "In the box",
      summary: "Four pieces, no plastic.",
      content: <BoxList shade={shade} setShade={setShade} />,
    },
    {
      id: "specs",
      title: "Specifications",
      summary: "Dimensions, materials and light.",
      content: (
        <table className="dm-sd-table">
          <caption className="sr-only">Rove task lamp specifications</caption>
          <tbody>
            <tr><th scope="row">Height</th><td>42 cm, adjustable to 54 cm</td></tr>
            <tr><th scope="row">Shade</th><td>Woven linen over powder-coated steel</td></tr>
            <tr><th scope="row">Light</th><td>2700 K, 480 lm, dimmable to 2%</td></tr>
            <tr><th scope="row">Power</th><td>USB-C, 18 W adapter included</td></tr>
            <tr><th scope="row">Weight</th><td>2.1 kg</td></tr>
          </tbody>
        </table>
      ),
    },
    {
      id: "compare",
      title: "Compare the family",
      summary: "Rove, Rove Mini and Rove Floor.",
      content: (
        <div className="dm-sd-compare-wrap">
          <table className="dm-sd-compare">
            <caption className="sr-only">Compare Rove lamp models</caption>
            <thead>
              <tr><th scope="col">Model</th><th scope="col">Height</th><th scope="col">Output</th><th scope="col">Price</th></tr>
            </thead>
            <tbody>
              <tr data-current="true"><th scope="row">Rove</th><td>42–54 cm</td><td>480 lm</td><td>£148</td></tr>
              <tr><th scope="row">Rove Mini</th><td>28–36 cm</td><td>310 lm</td><td>£112</td></tr>
              <tr><th scope="row">Rove Floor</th><td>128–146 cm</td><td>620 lm</td><td>£236</td></tr>
            </tbody>
          </table>
          <p>All models share the same shade fitment and repair programme.</p>
        </div>
      ),
    },
    {
      id: "care",
      title: "Care and repair",
      summary: "How to keep it working for a long time.",
      content: <CareForm />,
    },
    {
      id: "shipping",
      title: "Shipping restrictions",
      summary: "Some regions need a different cable.",
      disabled: showDisabled,
      content: (
        <p>
          This configuration ships with an EU plug. Orders outside the EU are
          paused while we qualify a local cable partner.
        </p>
      ),
    },
  ];

  return (
    <div className="dm-sd-root">
      <header className="dm-sd-bar">
        <span className="dm-sd-brand">APERTURE / OBJECTS</span>
        <span className="dm-sd-sku">No. 07 · Lighting</span>
      </header>

      <div className="dm-sd-layout">
        <div className="dm-sd-stage">
          <div className="dm-sd-art" aria-hidden="true">
            <svg viewBox="0 0 320 360" role="presentation" focusable="false">
              <defs>
                <radialGradient id="sd-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffe9b8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="320" height="360" fill="#e9e1d1" />
              <circle cx="160" cy="196" r="120" fill="url(#sd-glow)" opacity="0.55" />
              <ellipse cx="160" cy="322" rx="78" ry="10" fill="#2b3d32" opacity="0.12" />
              <path d="M132 124h56l-9 62h-38Z" fill="#f2ecdc" stroke="#2b3d32" strokeWidth="2" />
              <path d="M160 186v92" stroke="#2b3d32" strokeWidth="4" />
              <path d="M130 278h60" stroke="#2b3d32" strokeWidth="4" strokeLinecap="round" />
              <circle cx="160" cy="216" r="9" fill="#2b3d32" />
              <circle cx="160" cy="216" r="3" fill="#f2ecdc" />
              <path d="M124 124h72" stroke="#2b3d32" strokeWidth="2" />
            </svg>
            <span className="dm-sd-art-label">Rove / 42 cm / Oat</span>
          </div>
          <div className="dm-sd-chips">
            <span>Linen shade</span>
            <span>2700 K</span>
            <span>Repairable</span>
          </div>
        </div>

        <div className="dm-sd-info">
          <p className="dm-sd-eyebrow">TASK LIGHT / 2025</p>
          <h1>Rove</h1>
          <p className="dm-sd-price">
            £{price}
            <span>incl. VAT</span>
          </p>
          <p className="dm-sd-deck">
            A quiet desk lamp with a hand-tilted shade and a weighted base. Made
            to be repaired, not replaced.
          </p>

          <div className="dm-sd-buy">
            <div className="dm-sd-qty" role="group" aria-label="Quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => Math.min(9, current + 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="dm-sd-cart"
              onClick={() =>
                setCart(
                  `${quantity} × Rove${shade ? " with a second shade" : ""} added to the sample cart.`,
                )
              }
            >
              Add to cart · £{price * quantity}
            </button>
          </div>
          <p className="dm-sd-cart-note" role="status">
            {cart || "A sample storefront. Nothing is charged."}
          </p>

          <SpringDisclosure
            items={items}
            mode={mode}
            defaultOpen={["overview"]}
            className="dm-sd-disclosure"
          />
        </div>
      </div>
    </div>
  );
}
