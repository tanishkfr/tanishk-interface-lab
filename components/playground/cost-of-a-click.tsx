"use client";
import { useEffect, useRef, useState } from "react";
import { ProjectHeading, download } from "./workbench";
type Choice = {
  stage: string;
  choice: string;
  ms: number;
  detail: string;
};
const labels = ["The default", "The interruption", "The exit"];
export default function CostOfAClick() {
  const [step, setStep] = useState(-1),
    [results, setResults] = useState<Choice[]>([]),
    [checked, setChecked] = useState(true),
    [notifications, setNotifications] = useState(0),
    [confirm, setConfirm] = useState(false),
    [quietExit, setQuietExit] = useState(false);
  const start = useRef(0);
  const essay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step < 0) return;
    const heading = essay.current?.querySelector<HTMLElement>(
      ".essay-chapter h2, .essay-results h2",
    );
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [step]);
  function next(choice: string, detail: string) {
    const result = {
      stage: labels[step],
      choice,
      ms: Math.round(performance.now() - start.current),
      detail,
    };
    setResults((s) => [...s, result]);
    setStep((n) => n + 1);
    start.current = performance.now();
    setConfirm(false);
  }
  const complete = step === 3;
  return (
    <div ref={essay} className="project-world world-click">
      <div className="v2-wrap">
        <ProjectHeading slug="the-cost-of-a-click">
          <span className="project-stamp">
            An illustrative interaction essay
          </span>
        </ProjectHeading>
        <div className="essay-progress" aria-label="Essay progress">
          {labels.map((l, i) => (
            <span className={step >= i ? "active" : ""} key={l}>
              {l}
              {step > i && <span aria-hidden="true"> ✓</span>}
            </span>
          ))}
        </div>
        {step === -1 ? (
          <section className="essay-opening">
            <h2>
              You make
              <br />
              the choice<span>?</span>
            </h2>
            <div>
              <p>Sometimes the interface gets there first.</p>
              <p>
                This short, clearly framed demonstration uses preselected
                options, competing notifications, and a deliberately uneven exit
                to make interface decisions visible. No real subscription,
                tracking, or purchase occurs.
              </p>
              <button
                className="lab-button"
                onClick={() => {
                  setStep(0);
                  start.current = performance.now();
                }}
              >
                Try three small choices <span aria-hidden="true">→</span>
              </button>
              <span className="essay-time">
                About two minutes. You can leave at any time.
              </span>
            </div>
          </section>
        ) : step === 0 ? (
          <section className="essay-chapter">
            <div className="essay-chapter-copy">
              <h2>
                A choice was
                <br />
                already made.
              </h2>
              <p>
                Imagine you are joining a journal. Check the form before
                continuing. Nothing is submitted or saved outside this page.
              </p>
              <p className="essay-caption">Demonstration 1 of 3 · Defaults</p>
            </div>
            <div className="essay-demo default-demo">
              <span className="fictional-label">FICTIONAL SIGN-UP</span>
              <h3>
                A little more
                <br />
                in your inbox.
              </h3>
              <p>Get the occasional issue of Field Notes.</p>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <span>
                  Also send me partner offers and weekly recommendations.
                </span>
              </label>
              <button
                className="lab-button"
                onClick={() =>
                  next(
                    checked
                      ? "Kept the preselected option"
                      : "Unchecked the option",
                    checked
                      ? "The interface started with partner offers enabled. Continuing kept that starting state."
                      : "You changed the starting state before continuing.",
                  )
                }
              >
                Continue
              </button>
              <small>No email required. This is a simulation.</small>
            </div>
          </section>
        ) : step === 1 ? (
          <section className="essay-chapter">
            <div className="essay-chapter-copy">
              <h2>
                Attention has
                <br />a switching cost.
              </h2>
              <p>
                Your task: find the word <strong>quiet</strong> in the note. You
                can also open the competing notifications. Notice where your
                attention goes.
              </p>
              <p className="essay-caption">
                Demonstration 2 of 3 · Interruption
              </p>
            </div>
            <div className="essay-demo notification-demo">
              <div className="fake-notification">
                <span>Something just happened.</span>
                <button onClick={() => setNotifications((n) => n + 1)}>
                  Look now ({notifications})
                </button>
              </div>
              <div className="fake-notification second">
                <span>
                  {notifications
                    ? "Another thing just happened."
                    : "You might be missing something."}
                </span>
                <button onClick={() => setNotifications((n) => n + 1)}>
                  Open update
                </button>
              </div>
              <h3>A note on noticing</h3>
              <p>
                Between the tabs and the tiny red circles, there is a place
                where a thought can finish. It is{" "}
                <button
                  className="quiet-word"
                  onClick={() =>
                    next(
                      "Found quiet",
                      `You opened ${notifications} competing notification${notifications === 1 ? "" : "s"} before finishing the task.`,
                    )
                  }
                >
                  quiet
                </button>
                , but it is still here. You only need a moment to find it.
              </p>
              <p>
                Nothing urgent. Nothing to catch up on. Just one thought, given
                enough room.
              </p>
              <small>
                The notifications are illustrative distractions. There are no
                real messages.
              </small>
            </div>
          </section>
        ) : step === 2 ? (
          <section className="essay-chapter">
            <div className="essay-chapter-copy">
              <h2>
                One way in.
                <br />
                Three ways out.
              </h2>
              <p>
                You are leaving an imaginary subscription. Compare the prominent
                button with the smaller exit. Finish either way to reveal the
                choices you made.
              </p>
              <label className="fairness-control">
                <input
                  type="checkbox"
                  checked={quietExit}
                  onChange={(e) => {
                    setQuietExit(e.target.checked);
                    setConfirm(false);
                  }}
                />{" "}
                Give both choices equal emphasis
              </label>
              <p className="essay-caption">Demonstration 3 of 3 · Friction</p>
            </div>
            <div
              className={`essay-demo exit-demo${quietExit ? " equal-emphasis" : ""}`}
            >
              <h3>{confirm ? "Really, really sure?" : "Before you go…"}</h3>
              <p>
                {confirm
                  ? "This extra confirmation adds a step to the exit. The offer to stay was only one click."
                  : "Would you like to keep the imaginary subscription? The two choices below are intentionally unequal."}
              </p>
              <button
                className="lab-button"
                onClick={() =>
                  next(
                    "Chose to stay",
                    `The prominent stay path took one click. Equal emphasis was ${quietExit ? "enabled" : "disabled"}.`,
                  )
                }
              >
                Keep my subscription
              </button>
              <button
                className={quietExit ? "lab-button secondary" : "quiet-exit"}
                onClick={() => {
                  if (confirm || quietExit)
                    next(
                      "Completed the exit",
                      `The exit took ${quietExit ? "one click after equalizing the interface" : "two clicks, including an extra confirmation"}.`,
                    );
                  else setConfirm(true);
                }}
              >
                {confirm ? "Yes, finish leaving" : "No thanks, I want to leave"}
              </button>
              <small>
                A fictional demonstration. No account or payment exists.
              </small>
            </div>
          </section>
        ) : null}
        {complete && (
          <section className="essay-results">
            <h2>
              The interface
              <br />
              had a point of view.
            </h2>
            <p>Your choices in this demonstration:</p>
            <div className="essay-result-list">
              {results.map((r, i) => (
                <article key={r.stage}>
                  <span>{labels[i]}</span>
                  <h3>{r.choice}</h3>
                  <p>{r.detail}</p>
                  <small>
                    {(r.ms / 1000).toFixed(1)} seconds on this stage
                  </small>
                </article>
              ))}
            </div>
            <p className="essay-disclaimer">
              These timings describe this visit only. This is an authored
              illustration, not an experiment with research participants, a
              causal estimate, or a diagnosis of your behavior. Your results
              stay in browser memory until you leave.
            </p>
            <div className="essay-result-actions">
              <button
                className="lab-button"
                onClick={() => {
                  setStep(-1);
                  setResults([]);
                  setChecked(true);
                  setNotifications(0);
                  setConfirm(false);
                  setQuietExit(false);
                }}
              >
                Try it again
              </button>
              <button
                className="lab-button secondary"
                onClick={() =>
                  download(
                    "cost-of-a-click.json",
                    JSON.stringify(
                      { kind: "illustrative-demo", results },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Keep your observations
              </button>
            </div>
          </section>
        )}
        <section className="project-notes essay-sources">
          <h2>What to take away.</h2>
          <p>
            A default establishes a starting state. A notification competes with
            the task already underway. Unequal effort changes the available
            paths. Those are the mechanisms illustrated here; the page does not
            claim a measured effect size.
          </p>
          <div>
            <h3>Further reading</h3>
            <a
              href="https://www.deceptive.design/types"
              target="_blank"
              rel="noreferrer"
            >
              Deceptive Patterns · a taxonomy of interface practices ↗
            </a>
            <a
              href="https://www.ftc.gov/reports/bringing-dark-patterns-light"
              target="_blank"
              rel="noreferrer"
            >
              FTC · Bringing Dark Patterns to Light (2022) ↗
            </a>
            <a
              href="https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html"
              target="_blank"
              rel="noreferrer"
            >
              W3C · Understanding interruptions ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
