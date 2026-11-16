# Entrega IceHacks: ObraKadabra

Textos listos para copiar en el formulario del hackathon. Están en inglés, como el README y la app. Cada sección va en su propio campo.

**Categorías a las que postulamos:** Best AI Hack · Best Design & UX · Best Deployed App

---

## Short description (1 sentence)

ObraKadabra turns a phone photo of a floor plan into a 3D home that builds itself week by week with its schedule and budget, checks real progress from site photos with AI, and gives the family a link to follow the build.

## What it does

Most homes in Peru are self-built, floor by floor, without a schedule or a budget the family can follow. ObraKadabra fixes that from a single photo:

- **Upload a plan:** a photo or PDF of a 2D floor plan, with a one-step scale calibration and a warning when the photo is too blurry.
- **AI reads it:** a vision model returns every wall, door, window, column and room with a confidence score, and the user reviews only what the AI was unsure about in a 2D editor.
- **3D + 4D + 5D:** the plan becomes a 3D model linked to a schedule that follows how confined-masonry homes are really built in Peru (walls, then columns, then beams and slab, floor by floor) and to a takeoff and budget in soles. A timeline slider shows the house, the money spent, the S-curve and the materials to buy each week. The shopping list goes to the hardware store on WhatsApp or as a PDF.
- **Real progress from photos:** the foreman takes a site photo, the AI compares it with what was planned that week, and the foreman corrects and approves the findings before the 3D model is updated.
- **A link for the family:** a read-only, phone-first page with the overall progress, the time to move in, the money invested, the next "roofing day" and the 3D home with its timeline.

## How we built it

- **Next.js 16** (App Router, Cache Components), React 19 and TypeScript, styled with Tailwind CSS 4 from a design made in Google Stitch.
- **React Three Fiber** builds the 3D model procedurally from one `FloorPlan` contract. The AI produces that contract, the editor edits it, and the viewer, schedule and budget read it.
- **Gemini 3.5 Flash** vision with structured JSON output reads plans and site photos. Every answer is validated with Zod and retried once with the validation errors as feedback; `AI_MODEL=fixture` runs the whole app offline.
- **Pure domain code** (geometry, takeoff, schedule, earned value) with unit tests, separate from the UI.
- **Supabase** with anonymous sessions, row level security, private Storage for photos and a share-token function for public links. The same `ProjectRepository` falls back to browser storage, and both versions pass one shared contract test suite.
- **Quality:** Vitest and Playwright on desktop and mobile, axe-core on every route, and Lighthouse on the production build.
- **Claude Code** as a pair programmer, phase by phase, with project rules in `AGENTS.md` (no duplicates, small functions, one place per responsibility).

## Challenges we ran into

- Real plan photos are skewed, blurry and full of dimension lines. We added cropping, rotation, contrast, scale calibration and a blur check, cleaned the AI geometry and let users confirm only uncertain elements.
- Modeling the Peruvian confined-masonry order (walls before the columns that confine them, floor by floor) in both the schedule and the 3D colors.
- Keeping progress honest: only foreman-approved photos count, and the family view says "going by the plan" until a photo confirms it.
- Testing a WebGL app end to end: we exposed the 3D state as data attributes so tests never depend on pixels.
- Keeping the first load light on a phone: the 3D viewer, the Supabase SDK, the PDF library and the share dialog load only when used.

## Accomplishments we're proud of

- The full path from a plan photo to a 3D model with a schedule, a budget and real progress works on a phone.
- Every screen passes axe with no serious or critical issues on desktop and mobile.
- One test suite proves the browser storage and the Supabase storage behave the same.

## What we learned

- Validating AI output with the app's own schema, and retrying with the errors, turns most bad answers into good ones.
- Shared contract tests across storage backends catch real bugs (timestamp formats, a race that could create two anonymous users).
- Small, typed contracts (`FloorPlan`, `ProjectRepository`) let a 3D viewer, an editor, a schedule and a budget evolve in parallel.

## What's next for ObraKadabra

- Measure and tune the AI on a larger set of real hand-drawn and printed plans.
- Stairs, beams and roof slopes in the takeoff, plus regional price lists.
- Offline-first progress logging for sites without signal.
- Inviting the foreman and managing shared links from an account page.

## Built with (technologies)

Next.js · React · TypeScript · Tailwind CSS · React Three Fiber · three.js · drei · Zustand · Zod · Supabase (Postgres, Auth, Storage) · pdf.js · jsPDF · Vitest · Playwright · axe-core · Lighthouse · Vercel

## AI tools used

- **Gemini 3.5 Flash** (Google): vision model with structured JSON output that reads floor plans and compares site photos with the plan.
- **Claude Code** (Anthropic): AI pair programmer used to build the app phase by phase.
- **Google Stitch**: AI design tool used to generate the screen designs and design tokens.

## Links

- Repository: https://github.com/SteveArms/ObraKadabra
- Live demo: Pending
- Video (3 min): Pending
- Screenshots: `docs/capturas/`, plus a walkthrough video for the recording in `docs/capturas/recorrido-desktop.webm`
