<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Agent Rules

These rules apply to all AI-assisted work in this repository.

## 1. Read Before Editing

- Inspect the relevant implementation before making changes.
- Trace related components, styles, utilities, data flow, and tests when necessary.
- Read `package.json` before assuming available scripts or tooling.
- For Next.js APIs or conventions, follow the generated Next.js rule above and consult the local documentation in `node_modules/next/dist/docs/`.
- Do not make architecture-level assumptions from filenames alone.

## 2. Keep Changes Scoped

- Only modify files required for the current task.
- Prefer the smallest targeted change that correctly solves the problem.
- Do not perform unrelated refactors, formatting sweeps, renames, or cleanup.
- Do not rewrite working architecture unless the task explicitly requires it.
- Do not change public behavior outside the requested scope.

## 3. Preserve Existing Work

- Treat existing user changes as intentional unless proven otherwise.
- Never revert, overwrite, or remove unrelated modifications.
- Check the current working tree before making broad changes.
- Do not use destructive Git commands such as:
  - `git reset --hard`
  - `git clean -fd`
  - forced checkout of modified files
  - force push
- Do not delete files unless deletion is explicitly required by the task.

## 4. UI / Visual Changes

For visual, layout, animation, 3D, and interaction work:

- Preserve the existing visual direction unless the user explicitly requests a redesign.
- Do not change layout, dimensions, ratios, spacing, colors, typography, motion, camera positioning, hover behavior, or responsive behavior outside the requested scope.
- When given a visual reference, inspect the current implementation first and change only what is needed to reach the target.
- Avoid simplifying or replacing an existing visual system merely because another implementation would be easier.
- Preserve intentionally tuned 3D transforms, camera settings, object positions, animation timing, pointer interactions, and responsive logic unless they are part of the requested change.

## 5. 3D and Media Assets

- Do not modify, regenerate, convert, or replace `.glb`, `.gltf`, `.fbx`, `.obj`, `.blend`, video, or other binary/media assets unless explicitly requested.
- Prefer optimizing loading strategy, reuse, caching, lazy loading, or runtime behavior before altering source assets.
- Do not change asset paths or filenames without checking every reference first.

## 6. Dependencies

- Do not install, remove, or upgrade dependencies unless necessary for the requested task.
- Reuse existing packages and utilities when practical.
- Before adding a dependency, confirm the repository does not already provide equivalent functionality.
- Ask for approval before introducing a significant new dependency.

## 7. Commands and Safety

- Reading files and inspecting the repository is safe by default.
- Ask for approval before commands that:
  - modify many files,
  - install or remove packages,
  - modify Git history,
  - delete files,
  - alter databases,
  - modify deployment configuration,
  - push or publish anything.
- Never run `git push`, create releases, publish packages, or deploy without explicit instruction.
- Never commit changes unless explicitly asked.

## 8. Secrets and Credentials

- Never expose, print, copy, or commit API keys, tokens, passwords, cookies, credentials, or private environment values.
- Do not inspect `.env` or other secret files unless the task explicitly requires it.
- Never place secrets directly into source code.
- Use existing environment-variable conventions when credentials are required.

## 9. Generated and Heavy Files

Avoid inspecting or modifying generated/heavy directories unless specifically necessary:

- `node_modules/`
- `.next/`
- `.vercel/`
- `playwright-report/`
- `test-results/`
- coverage/build output
- large binary assets

Respect `.clineignore` and `.gitignore`.

## 10. Verification

After making code changes:

1. Review the diff for unintended changes.
2. Run the smallest relevant verification first.
3. Use existing project scripts from `package.json`.
4. Run relevant checks such as:
   - typecheck,
   - lint,
   - targeted tests,
   - build,
   - relevant Playwright tests.
5. Do not run unnecessarily expensive test suites when a targeted test is sufficient.
6. If verification fails, investigate the failure instead of hiding or bypassing it.
7. Clearly report any verification that could not be completed.

## 11. Existing Failures

- Do not assume every existing test or lint failure was caused by the current task.
- Distinguish pre-existing failures from regressions introduced by the change.
- Do not modify unrelated code just to make an unrelated failing test pass.
- Report pre-existing issues separately.

## 12. Responsive Behavior

- Check desktop and mobile implications when changing layout or interaction behavior.
- Preserve existing breakpoints unless the task specifically requires changing them.
- Avoid fixing one viewport by breaking another.

## 13. Performance

- Avoid unnecessary re-renders, repeated expensive calculations, duplicate asset loading, and excessive animation work.
- For animation or pointer-driven effects, prefer frame-efficient implementations.
- Do not remove intentional UI or motion merely as a shortcut to improve performance.
- Optimize while preserving expected appearance and behavior.

## 14. Planning vs Implementation

When asked to audit, inspect, review, analyze, or propose:

- Do not modify files unless the user also asks for implementation.
- First explain the findings and proposed scope.

When asked to implement or execute:

- Make the required change directly.
- Stay within the approved scope.
- Verify the result afterward.

## 15. Ambiguity

- When the requested outcome is clear, proceed without unnecessary clarification.
- When a missing decision could materially alter architecture, data, or destructive behavior, ask before proceeding.
- Do not invent requirements.

## 16. Completion

Before declaring a task complete:

- Confirm the requested behavior is actually implemented.
- Check for unintended changes.
- Report files changed.
- Report verification performed and its result.
- Mention any remaining limitation or unresolved issue.
- Never claim success if verification shows otherwise.