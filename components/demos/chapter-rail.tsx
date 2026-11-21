"use client";

import { useMemo } from "react";
import {
  ChapterRail,
  type Chapter,
} from "@/components/lab/chapter-rail/chapter-rail";
import type { DemoProps } from "./demo-host";
import "./chapter-rail-demo.css";

const SHORT = [
  { id: "quiet-pause", label: "The pause", title: "The shape of a pause" },
  { id: "attention-grain", label: "Attention", title: "Attention has a grain" },
  { id: "tools-wait", label: "Waiting", title: "Tools that wait" },
  { id: "quiet-vocabulary", label: "Language", title: "A vocabulary for quiet" },
  { id: "what-we-keep", label: "Keeping", title: "What we keep" },
];

const FULL = [
  { id: "quiet-pause", label: "The shape of a pause", title: "The shape of a pause" },
  { id: "attention-grain", label: "Attention has a grain", title: "Attention has a grain" },
  { id: "tools-wait", label: "Tools that wait", title: "Tools that wait" },
  { id: "quiet-vocabulary", label: "A vocabulary for quiet", title: "A vocabulary for quiet" },
  { id: "what-we-keep", label: "What we keep", title: "What we keep" },
];

export default function ChapterRailDemo({ values }: DemoProps) {
  const numbered = Boolean(values.numbers ?? true);
  const longLabels = String(values.labels ?? "short") === "long";
  const chapters = useMemo<Chapter[]>(
    () => (longLabels ? FULL : SHORT),
    [longLabels],
  );

  return (
    <div className="dm-cr-root">
      <div className="dm-cr-grid">
        <aside className="dm-cr-aside" aria-label="Article navigation">
          <ChapterRail chapters={chapters} numbered={numbered} />
          <p className="dm-cr-aside-foot">
            Field Office
            <br />
            Research note 014
          </p>
        </aside>

        <article className="dm-cr-article">
          <header className="dm-cr-masthead">
            <p className="dm-cr-kicker">FIELD OFFICE / RESEARCH NOTE 014</p>
            <h1>
              The quiet
              <br />
              interface
            </h1>
            <p className="dm-cr-deck">
              Notes on attention, software, and the small shapes a pause can
              take. Written slowly over one winter.
            </p>
            <div className="dm-cr-byline">
              <span>By Mira Chen</span>
              <span aria-hidden="true">·</span>
              <span>18 min read</span>
              <span aria-hidden="true">·</span>
              <span>March 2025</span>
            </div>
          </header>

          <section id="quiet-pause" className="dm-cr-section">
            <p className="dm-cr-chapter">01 · The shape of a pause</p>
            <h2>Most interfaces are afraid of silence.</h2>
            <p className="dm-cr-lede">
              We tend to fill the space between actions with reassurance:
              spinners, badges, a small green tick that arrives before we have
              decided whether we needed it. Quiet is treated as absence, as
              something to be corrected.
            </p>
            <p>
              But silence is not empty. In a reading room it is the material
              that lets a page become legible. In a conversation it is where
              the next thought is assembled. In software it can be the
              difference between a tool that follows you and a tool that waits
              for you.
            </p>
            <p>
              This note is about that wait. Not latency, which is a
              technical measurement, but the deliberate interval a surface can
              hold while a person decides what they mean. The pause is a design
              material. It has a shape, a weight and a cost.
            </p>
            <figure className="dm-cr-figure">
              <div className="dm-cr-specimen" aria-hidden="true">
                <span />
                <span />
                <span />
                <i />
              </div>
              <figcaption>
                Fig. 1 — Three states of a single surface. The middle state is
                the one most products remove.
              </figcaption>
            </figure>
            <p>
              A pause is not the same as slowness. The fastest interface can
              still be quiet if it does not narrate every transition. The
              slowest can be noisy if it keeps asking to be noticed. Quiet is a
              property of attention, not a stopwatch.
            </p>
          </section>

          <section id="attention-grain" className="dm-cr-section">
            <p className="dm-cr-chapter">02 · Attention has a grain</p>
            <h2>Interfaces cut across the direction of thought.</h2>
            <p>
              Attention is not a spotlight. It has a grain, like wood. Some
              movements go with it; others require force. A notification that
              arrives mid-sentence does not merely interrupt the sentence. It
              changes the posture of the person writing it.
            </p>
            <blockquote>
              The best interface is not the one that disappears. It is the one
              that knows when to be findable.
            </blockquote>
            <p>
              We interviewed twelve people who work with long documents for a
              living. None of them described their ideal tool in terms of
              features. They described a quality of presence: available when
              called, absent when not. One editor called it “a good chair.” You
              notice it only when it fails.
            </p>
            <div className="dm-cr-annotation">
              <span>Annotation</span>
              <p>
                The same person described closing every sidebar in her editor
                at the start of each day. Her workspace is not minimal because
                she dislikes tools. It is minimal because she is protecting the
                first ten minutes.
              </p>
            </div>
            <p>
              This suggests a different test for interaction design. Instead of
              asking whether a control is discoverable, ask what it costs to
              ignore. A control that can be ignored without penalty is a quiet
              control. One that demands acknowledgement is a small debt.
            </p>
          </section>

          <section id="tools-wait" className="dm-cr-section">
            <p className="dm-cr-chapter">03 · Tools that wait</p>
            <h2>The interface should hold still while you move.</h2>
            <p>
              There is a particular kind of motion that makes a surface feel
              alive without making it loud: a selection that travels rather
              than teleports, a panel that grows from the control that opened
              it, a number that rolls to its new value. The motion is not
              decoration. It is a record of where things came from.
            </p>
            <p>
              Continuity is the difference between a change and a replacement.
              When a list filters down, the surviving rows should move. When a
              sheet closes, the object that opened it should still be there.
              When a value changes, the digits that did not change should stay
              put. These are small promises, but they accumulate into trust.
            </p>
            <figure className="dm-cr-figure dm-cr-figure--wide">
              <div className="dm-cr-strip" aria-hidden="true">
                {[32, 58, 41, 76, 63, 88, 54, 70, 46, 81].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <figcaption>
                Fig. 2 — Movement as evidence. Each step is visible, but none of
                them asks to be watched.
              </figcaption>
            </figure>
            <p>
              The temptation is to make the motion legible by making it larger.
              A longer duration, a deeper overshoot, a shadow that lifts. The
              result is usually the opposite: the interface becomes a
              performance of change rather than a record of it. Restraint is
              not the absence of character. It is character with a lower
              speaking voice.
            </p>
            <ul className="dm-cr-list">
              <li>Move the thing that changed, not the whole room.</li>
              <li>Let an exit finish before asking for another entrance.</li>
              <li>Measure before animating; never animate an assumption.</li>
            </ul>
          </section>

          <section id="quiet-vocabulary" className="dm-cr-section">
            <p className="dm-cr-chapter">04 · A vocabulary for quiet</p>
            <h2>We need words for the parts that do not announce themselves.</h2>
            <p>
              Design critique is good at describing what is present. It is
              less good at describing what has been withheld. A surface can be
              confident because it does not explain itself twice. A transition
              can be complete because it ends. A color can be enough because it
              is the only one.
            </p>
            <p>
              The vocabulary below is a working draft. It is not a checklist.
              It is a way to point at a quality that everyone recognizes and
              few teams can name in a review.
            </p>
            <div className="dm-cr-table" role="table" aria-label="Quiet interface vocabulary">
              <div role="row" className="dm-cr-table-head">
                <span role="columnheader">Term</span>
                <span role="columnheader">What it protects</span>
                <span role="columnheader">Failure looks like</span>
              </div>
              {[
                ["Reserve", "The next thought", "A tooltip for every icon"],
                ["Continuity", "Spatial memory", "A panel that replaces its source"],
                ["Settling", "The end of an action", "Motion that never resolves"],
                ["Proof", "Trust in a result", "A success state with no evidence"],
              ].map((row) => (
                <div role="row" key={row[0]}>
                  <span role="cell">{row[0]}</span>
                  <span role="cell">{row[1]}</span>
                  <span role="cell">{row[2]}</span>
                </div>
              ))}
            </div>
            <p>
              None of these qualities are visible in a static frame. They live
              in the second interaction, the third attempt, the moment after
              the pointer leaves. This is why they are easy to miss in a design
              review and easy to feel in a product.
            </p>
          </section>

          <section id="what-we-keep" className="dm-cr-section">
            <p className="dm-cr-chapter">05 · What we keep</p>
            <h2>A quiet interface leaves room for the person using it.</h2>
            <p>
              The research began with a simple question: why do some tools feel
              calm even when they are doing complicated things? The answer was
              rarely a single feature. It was a consistent posture — a
              willingness to be unfinished, to hold a state without narrating
              it, to let the person be the loudest thing in the room.
            </p>
            <p>
              We keep returning to the same image: a reading desk with one lamp,
              one book and a window. Nothing on the desk is trying to get your
              attention. Everything on it is ready. That is the standard.
            </p>
            <div className="dm-cr-end">
              <span>End of note</span>
              <span>Field Office · 2025</span>
            </div>
            <p className="dm-cr-colophon">
              With thanks to the twelve editors, archivists and researchers who
              let us watch them work. This is a fictional research note made for
              the LAB/ component preview.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
