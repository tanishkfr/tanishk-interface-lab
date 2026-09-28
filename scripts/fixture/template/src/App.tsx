import { useState } from "react";
import { SignalField } from "@/components/lab/signal-field/signal-field";
import { EvidenceCarousel } from "@/components/lab/evidence-carousel/evidence-carousel";
import { AgentReviewSurface } from "@/components/lab/agent-review/agent-review";
import { CommandMenu } from "@/components/lab/command-menu/command-menu";
import { AdaptiveComposer } from "@/components/lab/adaptive-composer/adaptive-composer";
import { SoftSnap, SoftSnapItem } from "@/components/lab/soft-snap/soft-snap";

/**
 * Fixture consumer — a throwaway Vite project that proves the Lab's
 * registry items install and render outside the Lab itself.
 */
export function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-12 p-8">
      <h1 className="text-2xl font-semibold">Lab fixture consumer</h1>

      <section className="h-64 rounded-xl border border-black/10">
        <SignalField className="h-full w-full" accent="#4f27e0" />
      </section>

      <section>
        <EvidenceCarousel
          label="Fixture gallery"
          items={[
            { id: "a", caption: "First", content: <div className="h-full w-full bg-amber-100" /> },
            { id: "b", caption: "Second", content: <div className="h-full w-full bg-sky-100" /> },
            { id: "c", caption: "Third", content: <div className="h-full w-full bg-emerald-100" /> },
          ]}
        />
      </section>

      <section>
        <AgentReviewSurface
          change={{
            id: "f1",
            title: "Rename column `total` to `amount`",
            rationale: "Matches the billing schema.",
            files: [
              {
                path: "db/orders.sql",
                hunks: [
                  { kind: "context", text: "CREATE TABLE orders (", line: 12 },
                  { kind: "remove", text: "  total_cents integer", line: 13 },
                  { kind: "add", text: "  amount_cents integer", line: 13 },
                  { kind: "context", text: ");", line: 14 },
                ],
              },
            ],
          }}
          onDecision={(decision) => console.log("decision", decision)}
        />
      </section>

      <section>
        <button
          type="button"
          className="rounded-md border px-3 py-2"
          onClick={() => setMenuOpen(true)}
        >
          Open commands
        </button>
        <CommandMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          items={[
            {
              id: "c1",
              label: "New draft",
              group: "Create",
              description: "Starts a draft.",
              run: () => console.log("ran new draft"),
            },
            {
              id: "c2",
              label: "Go to settings",
              group: "Navigate",
              run: () => console.log("ran settings"),
            },
          ]}
        />
      </section>

      <section className="rounded-xl border border-black/10 p-4">
        <AdaptiveComposer sample="review the deck with Ana on tue 2pm for 45m" />
      </section>

      <section className="h-96 overflow-hidden rounded-xl border border-black/10">
        <SoftSnap mode="proximity" className="h-full p-4">
          {[0, 1, 2, 3].map((index) => (
            <SoftSnapItem key={index}>
              <div className="flex h-56 items-center justify-center rounded-xl border border-black/10 bg-white text-sm">
                Card {index + 1}
              </div>
            </SoftSnapItem>
          ))}
        </SoftSnap>
      </section>
    </div>
  );
}
