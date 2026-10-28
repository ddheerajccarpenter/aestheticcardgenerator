# Completed UI/UX updates

## Gallery

- Restored the Roomy and Compact layout controls.
- Made Preview, Use template, and Copy actions visible on each card.
- Restored author and design dimension details.

## Canvas editor

- Grouped Add menu options into clearer Text & media and Shapes sections.
- Made the advanced elements drawer easier to find and labeled it “More elements (7)”.
- Added supporting copy that identifies the tools in that drawer.
- Kept the existing canvas editing tools and capabilities available.
- Added a Quick start guide for the empty canvas state.
- Kept the Inspector's selected-layer actions pinned while properties scroll and added a visible Delete label.
- Moved the floating layer toolbar away from the top canvas edge and kept it centered within the canvas at its left and right edges.
- Batched object movement through animation frames and used GPU-friendly transforms; pointer-up now lets the final queued move apply before ending the drag.
- Applied the requested Jungle Troubles, Designer, and Stretch Pro family roles to headings, regular UI text, and brand names.

## Information pages and navigation

- Reworked About and FAQ content to describe the current app accurately.
- Clarified browser storage, privacy, export formats, aspect ratios, and licensing information.
- Removed unsupported accessibility claims and clarified the accessibility page.
- Organized footer navigation into Design, Help & info, and Policies sections.
- Added a direct help panel with Guides and Contact links.

## Verification

- Production build completed successfully.
- Lint completed with existing warnings in GuideIndexView, App, AdSlot, and EditorView hooks; no warnings appeared in the new 3D controls or renderer.
- Checked the gallery layout toggle and card preview/actions, the Canvas Add menu and tool drawer, adding a text layer with undo, and the updated Help page links.
- Checked an empty canvas, adding and dragging a text layer, the Delete controls while the Inspector was scrolled, and deleting the temporary layer back to the empty state.
- Whitespace checks passed for the files changed in this update.

## Warm color and 3D preview update (2026-10-28)

- Shifted the app UI to warm paper, ink, and muted clay in both themes; card artwork colors remain unchanged.
- Added a consistent rounded-corner scale for controls, popovers, and editor stages.
- Replaced hover-only 3D tilt with drag-to-orbit, wheel and touch zoom, bounded on-screen zoom controls, and a reset view action.
- Fit the camera to the card and keep it correctly framed when the preview resizes.
- Gave the physical card subtle rounded edges, clearer surface lighting, and sharper texture filtering while keeping rendering on-demand.
- Checked 3D rotation, both zoom buttons, scroll-wheel zoom, reset, warm theme tokens, and rounded corners in the local canvas preview.

The palette was kept warm and low-saturation; text contrast follows the [WCAG minimum contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Orbit and zoom behavior follows the [Three.js OrbitControls documentation](https://threejs.org/docs/pages/OrbitControls.html), with resize handling based on its [responsive rendering guide](https://threejs.org/manual/pages/responsive.html).

## Gallery and static-site redesign (2026-10-28)

- Rebuilt the landing page as a gallery-first studio with real template previews, direct Canvas and template entry points, searchable/category-filtered cards, and visible Preview, Use template, and Copy actions.
- Reworked the template library and global header into a rounded, editorial layout; preserved all 70 designs, categories, comparison, creator, canvas, and guide routes.
- Replaced the Creator workspace's remaining hard-coded chrome colors with shared theme tokens, and aligned blog/error accents with the same muted clay accent. Canvas and template artwork colors remain available as design choices.
- Shifted application surfaces to warm graphite, paper, and clay, with coordinated dark/light themes and rounded controls, panels, and editor stage. Design artwork colors remain intact.
- Added a static Astro route layer around the existing client-side React product, with route-specific titles, descriptions, canonical metadata, social metadata, generated category/guide/blog routes, and a designed 404 page. The editor and local-first data flow remain in the browser; no backend was added.
- Added cache headers for Astro's fingerprinted assets and kept HTML revalidation and the existing security headers.
- Updated the 404 template count to read from the live template collection and corrected its ID-card category link to the generated route.
- Checked light-theme rendering, direct category and unknown routes, gallery content, editor entry points, canvas editing tools, and 3D rotation/zoom/reset in the local preview.
- TypeScript and the production static build passed; Astro generated 37 routes. Lint passed with existing warnings in legacy app/editor hooks and the ad component. Whitespace checks passed.
- The production dependency audit still reports a high-severity Zod advisory through `@imgly/background-removal`; npm reports no compatible fix. The suggested breaking downgrade was not applied because it could remove the current background-removal capability.

Official references: [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/), [Astro static route generation](https://docs.astro.build/en/reference/routing-reference/), [Cloudflare static deployment](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), and [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Not checked

- Did not manually exercise every export format and resolution option.
- The DaFont files are not bundled. The supplied Jungle Troubles, Designer, and Stretch Pro pages identify the fonts as personal-use-only; commercial web use requires appropriate licenses and font files ([Jungle Troubles](https://www.dafont.com/jungle-troubles.font), [Designer](https://www.dafont.com/designer-2.font), [Stretch Pro](https://www.dafont.com/stretch-pro.font)).
- Freeicons' latest page contains mixed icon packs and licenses. The current Lucide icon set remains in place to keep the editor's tool icons consistent.
- The supplied MOV could not be decoded into frames in this environment, so the implementation follows the supplied written briefs and the visible editor screenshot.
