# LAB refinement — November 18, 2026

Current local preview: http://localhost:3312. Nothing deployed or pushed.

- Twenty automatically changing vector hero treatments, each with its own reveal, at 2.8-second intervals. No printing controls or corner captions. Woven paper replaces the cursor treatment: thirteen strips arrive from opposite directions to assemble the lettering. Reduced motion keeps a static treatment; hidden/offscreen heroes stop their timers.
- Staggered gallery columns and full-width intervals follow the supplied sketch. Artwork has subtle desktop scroll parallax; phone layouts stack. BRUTAL.EXE fills its column and shows all four panels; light artwork gets an outline.
- Removed the duplicated sidebar heading and search. The component library retains its main search and now lists twenty components.
- Added Scrub Number: native numeric input, pointer scrubbing, arrow/Shift/Home/End keyboard controls, bounded values, live specimen, API and accessibility documentation, source and registry payload.
- Added Text Desk, a third independent tool: whitespace cleanup, quote normalization, duplicate-line removal, case conversion, counts, copy and UTF-8 text download. Original and output remain visible; text stays in the browser.
- Replaced the footer with a typographic colophon and an accessible four-section directory. Reworked Products badge, heading, paragraph and button spacing.

Verification: production build generates 84 static pages; targeted lint passes. Browser tests cover Scrub Number typing, pointer dragging, keyboard steps and bounds; actual text cleanup/download; twenty component records; sidebar removal; woven-letter reveal completion; and 24 route/viewport combinations including 320px. Accessibility scan passes for all main scanned pages and twenty preview documents. Scrub Number installs through the real shadcn CLI into a clean consumer fixture and compiles alongside six existing components. Captures and reports are in `output/latest/` and `output/refinement/`.

Checked with installed Chrome and phone emulation; real mobile hardware and other browser engines remain untested. Earlier pass reports are historical checkpoints.
