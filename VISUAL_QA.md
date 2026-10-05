# Visual QA and rejection checklist

Use after every UI change. Inspect the rendered page twice: first for function, then for visual authorship. The 29 source objections are adapted below; they are judgment criteria, not a substitute for looking at the result.

## Colour, type, and hierarchy (1–9, 25–29)

- [ ] Only slate/ink and one restrained teal accent are competing for attention. Error and warning colours convey state, not decoration. No borrowed brand colours or purple-blue AI gradient.
- [ ] No highlighter pill, pileup of coloured phrases, or arbitrary italic emphasis.
- [ ] Plus Jakarta Sans carries interface and prose. Monospace appears only for actual technical identifiers, code, or terminal content. No third typeface.
- [ ] Hero, section heading, body, and metadata form a deliberate scale. Text is readable at realistic screen size; metadata is not microscopic.
- [ ] Each page leads to useful content. Avoid a sterile checklist result, the first unrefined visual solution, and meaningless recolours.
- [ ] Ask: if the name and images were removed, would this still look like a generic portfolio template? If yes, use Yahya's actual work, evidence, and voice to fix it.

## Content and decoration (10–15, 19–22, 24)

- [ ] No coloured edge stripes, arbitrary emoji/symbol icons, generic loop arrows, decorative lines, generic motivational footer CTA, fake charts, or stock keyboard photos.
- [ ] Any diagram communicates real approved information, with correct connectors and a caption. No fake technical nodes or incomplete arrowheads.
- [ ] No half-sentence is trapped in a decorative box. Lists and case-study proof need not be a wall of identical rectangles.
- [ ] Portraits and covers are approved assets. Claims, metrics, technologies, and outcomes stay within `PROJECT_HANDOFF.md` and the approved profile.

## Layout and responsive checks (16–18, 23, 25)

- [ ] Check desktop around **1440px**, laptop **1024px**, tablet **768px**, and mobile **430px**, **390px**, **375px**.
- [ ] Look for awkward wraps, orphan words, dead space, inconsistent gutters, compressed buttons, oversized cards, navigation overflow, and horizontal scrolling.
- [ ] Reflow and edit copy before shrinking text. Body, captions, and metadata remain readable; long headings and project titles wrap naturally.
- [ ] Confirm images load at intended sizes without layout shift or misleading crop. Case-study galleries remain usable on mobile.

## Interaction, accessibility, and consistency

- [ ] Navigate Home, Work tabs and filters, all project routes, About, recruiter role tabs, Resume, Contact, Terminal, and the locked page.
- [ ] Check redirects, image expansion, menu opening/closing, keyboard focus, form labels, contrast, reduced motion, and no obvious console errors.
- [ ] The same colour, type, spacing, and focus logic works across pages, while page structures respond to their content rather than matching mechanically.
- [ ] Review the result after the first implementation. Identify what still feels generated or templated, refine it, and run the viewport pass again.
