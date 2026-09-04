# NATSX Portfolio — Upgrade Roadmap

## Goal

Raise the portfolio's **wow factor, interaction quality, and perceived craft** without losing the current NATSX identity: editorial, restrained, typography-led, spacious, and professional.

This roadmap is intentionally **not** a redesign. The current visual system is the baseline and should stay recognizable.

---

## Core Direction

### Keep

- Editorial visual language.
- Black / off-white / violet accent system.
- Large typography and generous whitespace.
- Existing custom intro.
- Existing custom route transition.
- Existing page-specific motion dialects.
- Black-and-white hero portrait direction.
- Case-study-first project presentation.
- Existing custom motion architecture rather than introducing a second animation framework.

### Avoid

- Copying dark-tech portfolio aesthetics.
- Rounded-card overload.
- Generic WebGL / 3D effects with no narrative purpose.
- Making every section animated just because it can be animated.
- Replacing readability with spectacle.
- Page morph transitions.
- Rebuilding the current layout system.
- Adding Framer Motion / Motion React unless the current custom system genuinely cannot support a required interaction.

---

# Priority 0 — Protect the Current Baseline

Before every upgrade phase:

- [ ] Work on a feature branch.
- [ ] Preserve the current layout and spacing unless the task explicitly requires otherwise.
- [ ] Keep `prefers-reduced-motion` behavior intact.
- [ ] Do not modify unrelated page motion.
- [ ] Run the existing full verification pipeline.
- [ ] Test desktop and mobile.
- [ ] Compare the result against the previous visual baseline before accepting it.

**Definition of done:** the new interaction feels additive, not like a redesign.

---

# Priority 1 — Home: Make Selected Work the Second Hero

Current Home already has a strong sequence:

1. Hero
2. Selected Work
3. Capabilities
4. About Preview
5. Playground Preview
6. Contact Footer

The biggest opportunity is not adding more sections. It is making the existing sections feel more connected and giving **Selected Work** the same presence as the Hero.

## 1.1 Immersive Selected Work Stage

Current Selected Work already gives each featured project a unique presentation. Keep that art direction, but make each project feel like a scene rather than a static project block.

### Upgrade ideas

- [ ] Add restrained image depth / scale while a project enters the viewport.
- [ ] Let project number, title, disciplines, and year move at subtly different speeds.
- [ ] Add a clear active-project feeling while scrolling through featured projects.
- [ ] Create stronger visual handoff from one featured project to the next.
- [ ] Make project artwork respond subtly to pointer movement on desktop.
- [ ] Keep project-specific visual identity instead of forcing one repeated template.
- [ ] Improve hover / focus state so clicking a project feels deliberate and tactile.

### Do not

- Do not turn this into a clone of a horizontal 3D carousel.
- Do not hide project information behind interaction.
- Do not make scrolling feel locked or hijacked.

**Impact:** Very high  
**Risk:** Medium  
**Execute first:** Yes

---

## 1.2 Hero Ambient Signature

The magnetic portrait is already the primary interaction. Do not replace it. Add one subtle secondary layer so the Hero feels alive even before the user moves the pointer.

### Candidate direction

Use very large editorial background typography or indexing such as:

- `DIGITAL / CREATOR`
- `DESIGN / DEVELOPMENT / MOTION`
- NATSX index / coordinate / grid language

The background layer should move extremely slowly with scroll or pointer parallax and remain visually subordinate to the portrait and main copy.

### Requirements

- [ ] No marquee-like distraction.
- [ ] No competing focal point with the portrait.
- [ ] Movement should be almost ambient.
- [ ] Mobile version should be simplified or static.
- [ ] Respect reduced motion.

**Impact:** High  
**Risk:** Medium

---

## 1.3 Hero → Selected Work Handoff

The page currently has strong motion inside individual sections. The next improvement is to connect those sections.

### Goal

Make the end of the Hero naturally lead into Selected Work rather than feeling like:

`Hero ends → new section begins`.

### Candidate choreography

- Hero decorative geometry drifts toward the work section.
- Hero metadata exits in the same visual direction that Selected Work metadata enters.
- The first project visual starts becoming visible before the Hero is fully gone.
- The transition must remain normal document scrolling — no scroll-jacking.

**Impact:** Very high  
**Risk:** Medium-high

---

# Priority 2 — Home: Improve Section-to-Section Choreography

After Hero → Selected Work works, continue the same principle through Home.

## 2.1 Selected Work → Capabilities

- [ ] Use project metadata / line structure as the visual bridge into capabilities.
- [ ] Avoid resetting every section to opacity `0` and starting from scratch.
- [ ] Create one shared directional rhythm.

## 2.2 Capabilities → About Preview

- [ ] Let capability rows finish in a way that introduces the About layout.
- [ ] Consider a typography handoff rather than another decorative shape.

## 2.3 About Preview → Playground Preview

- [ ] Increase contrast between the structured About section and experimental Playground section.
- [ ] Use the transition between them as the moment where motion becomes slightly more playful.

## 2.4 Playground Preview → Contact Footer

- [ ] Calm motion down approaching the final CTA.
- [ ] Make the contact destination feel intentional and conversion-focused.

**Impact:** High  
**Risk:** Medium

---

# Priority 3 — Work Page: Upgrade the Archive Interaction

The Work page already uses a strong editorial archive with project rows and hover preview imagery. Do not replace the archive structure.

## 3.1 Richer Project Row Interaction

- [ ] Improve preview image arrival / departure so it feels less like a tooltip and more like an editorial insert.
- [ ] Add subtle cursor-relative movement to the preview frame.
- [ ] Let title, disciplines, year, and arrow react with different but coordinated micro-motion.
- [ ] Strengthen active row hierarchy without dimming everything excessively.
- [ ] Ensure keyboard focus receives an equivalent visual state.

## 3.2 Archive Continuity

- [ ] Give the project list a stronger scrolling rhythm.
- [ ] Use project accent colors sparingly as transient interaction cues.
- [ ] Keep rows readable even without hover.

## 3.3 Work → Project Detail Handoff

Do not use a full shared-element morph. Instead create continuity using:

- color,
- direction,
- image crop,
- typography timing,
- project number / title.

The route transition should introduce the project, then the project-detail hero should immediately continue the same visual momentum.

**Impact:** Very high  
**Risk:** Medium

---

# Priority 4 — Project Detail: Make Case Studies Feel More Directed

Project detail pages are one of the strongest professional advantages of the portfolio. Improve their pacing rather than making them more decorative.

## 4.1 Hero Entry

- [ ] Synchronize project title, role, year, and hero image with route-transition handoff.
- [ ] Make project hero media feel physically present through subtle scale / crop reveal.

## 4.2 Narrative Scroll Rhythm

- [ ] Alternate dense information with visual breathing room.
- [ ] Strengthen transitions between Context → Problem → Process → Solution → Outcome.
- [ ] Use recurring project-specific motion motifs rather than generic reveal everywhere.
- [ ] Make large screenshots feel staged rather than simply inserted into the document.

## 4.3 Image Treatment

- [ ] Add subtle image reveal / crop logic appropriate to each project.
- [ ] Use device / browser framing only where it adds context.
- [ ] Avoid over-framing every screenshot.

## 4.4 Project Ending

- [ ] Improve the next-project handoff.
- [ ] Let project identity transition toward the next case study.
- [ ] Keep a strong route back to the Work archive.

**Impact:** Very high  
**Risk:** Medium

---

# Priority 5 — About: Increase Personality Without Losing Editorial Restraint

About already has strong structure: Hero, portrait/story, approach, disciplines, closing.

## 5.1 Portrait / Story Interaction

- [ ] Keep the identity portrait as the anchor.
- [ ] Add subtle state changes as the story scrolls, not large transformations.
- [ ] Consider small typography/index changes around the portrait to show progression.

## 5.2 Principles

- [ ] Improve interaction between principle number, title, and description.
- [ ] Use hover only as enhancement; the section must remain complete without it.

## 5.3 Disciplines

- [ ] Make discipline rows feel more tactile.
- [ ] Use restrained line / number movement rather than card effects.
- [ ] Consider contextual micro-preview only if it genuinely adds meaning.

**Impact:** Medium-high  
**Risk:** Low-medium

---

# Priority 6 — Playground: Make It the Motion Sandbox

Playground is the one page where the site can intentionally become more experimental.

The Hero should remain clean. The unnecessary vertical divider has been removed; keep that cleaner direction.

## 6.1 Lab Interaction

- [ ] Increase responsiveness to pointer / scroll inside experiment modules.
- [ ] Give experiments distinct micro-behaviors rather than one repeated reveal.
- [ ] Keep performance stable.

## 6.2 Section Handoffs

- [ ] Hero → Lab should feel like entering an experimental mode.
- [ ] Lab → Manifesto can be more expressive than other pages.
- [ ] Manifesto → Closing should gradually return to the main portfolio language.

## 6.3 Experimental Limits

- [ ] No visual experiment may reduce basic navigation usability.
- [ ] Mobile must have simplified fallbacks.
- [ ] No permanent GPU-heavy effect purely for decoration.

**Impact:** Medium-high  
**Risk:** Medium

---

# Priority 7 — Contact: Improve Conversion and Final Impression

The contact page should be visually strong but simpler than Work / Playground.

- [ ] Make the main contact action unmistakable.
- [ ] Improve copy / email interaction feedback.
- [ ] Add subtle response when hovering or focusing contact methods.
- [ ] Make the final page state feel like the natural end of the portfolio journey.
- [ ] Avoid excessive animation near the primary CTA.

**Impact:** Medium  
**Risk:** Low

---

# Priority 8 — Site-Wide Microinteractions

Only after the major choreography work is complete.

## Navigation

- [ ] Refine active navigation state movement.
- [ ] Improve hover/focus transitions while keeping header visually stable.
- [ ] Preserve route transition behavior.

## Links

- [ ] Normalize arrow behavior across project links / CTA links.
- [ ] Normalize underline / line-draw timing.
- [ ] Ensure keyboard focus feels designed, not default-added afterward.

## Cursor / Pointer

- [ ] Only add custom cursor behavior if it communicates interaction state.
- [ ] Never replace the system pointer globally for decoration alone.

## Image Interaction

- [ ] Use one consistent family of hover depth / scale values.
- [ ] Avoid each image behaving differently without a reason.

**Impact:** Medium  
**Risk:** Low

---

# Priority 9 — Mobile Motion Pass

Mobile should not simply be a smaller desktop animation.

- [ ] Review every custom animation at 360px, 390px, 430px widths.
- [ ] Shorten large movement distances.
- [ ] Reduce simultaneous moving layers.
- [ ] Keep route transitions responsive.
- [ ] Ensure project previews do not rely on hover.
- [ ] Preserve section hierarchy with touch-first interaction.
- [ ] Avoid cumulative layout shift during media loading.

**Impact:** High  
**Risk:** Medium

---

# Priority 10 — Performance / Accessibility / Motion Quality

Every visual upgrade must pass this phase before being considered finished.

## Performance

- [ ] Prefer transforms and opacity for continuous motion.
- [ ] Avoid unnecessary layout reads in animation loops.
- [ ] Keep image sizes appropriate for viewport usage.
- [ ] Audit long-running ambient animation CPU/GPU cost.
- [ ] Pause ambient animation when offscreen where possible.

## Accessibility

- [ ] Preserve `prefers-reduced-motion` fallbacks.
- [ ] Ensure route transitions never trap focus.
- [ ] Ensure keyboard navigation has equivalent feedback.
- [ ] Keep text contrast and readability intact.
- [ ] Decorative motion must stay `aria-hidden` where appropriate.

## Motion Quality Checklist

Every new motion should answer at least one question:

1. Does it explain hierarchy?
2. Does it connect two states?
3. Does it communicate interaction?
4. Does it reinforce NATSX identity?

If the answer is **no to all four**, remove it.

---

# Recommended Execution Order

## Phase A — Highest Visual Return

1. [ ] Home Selected Work immersive interaction.
2. [ ] Hero → Selected Work scroll handoff.
3. [ ] Hero ambient signature layer.
4. [ ] Work archive interaction refinement.

## Phase B — Portfolio Storytelling

5. [ ] Work → Project Detail continuity.
6. [ ] Project detail narrative motion pass.
7. [ ] Home section-to-section choreography.
8. [ ] Project ending / next-project handoff.

## Phase C — Personality

9. [ ] About interaction polish.
10. [ ] Playground experimental motion pass.
11. [ ] Contact final-impression polish.

## Phase D — Final Polish

12. [ ] Site-wide microinteraction normalization.
13. [ ] Mobile-specific motion pass.
14. [ ] Performance and accessibility audit.
15. [ ] Final consistency audit across EN / ID routes and all project pages.

---

# First Execution Target

## `A1 — Selected Work Immersive Interaction`

This should be the next implementation task because it offers the largest visual improvement without changing the site's identity or information architecture.

### Scope for A1

- Keep current project layouts and artwork.
- Add active project scroll state.
- Add layered motion to project media / title / metadata.
- Add subtle pointer depth to artwork on desktop.
- Improve project hover / focus feedback.
- Preserve normal scrolling.
- No carousel conversion.
- No scroll-jacking.
- No additional animation library.
- Full reduced-motion fallback.

### Acceptance criteria

- Selected Work feels like a major experience, not a list of project sections.
- Each project still has its own art direction.
- Navigation through the section remains fast and readable.
- Motion does not overpower project content.
- Mobile interaction remains simple and stable.
- Existing verification pipeline stays green.

---

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Locked / approved

This document should be updated as each phase is implemented and approved.