# Repository Guidelines

## Project Structure & Module Organization
- Root-only static app: `index.html`, `styles.css`, `app.js`.
- UI is rendered directly from `app.js`; no build system, bundler, or framework.
- `app.js` is organized by layers: domain models (`Idea`, `Project`), data (`LocalStorageProjectRepository`), use cases (`ProjectService`), UI (`ProjectIdeaUI`), and visual utilities (`ThemeService`, `PolyBackground`).
- Assets are embedded (Google Fonts) and there are no images or external files.

## Build, Test, and Development Commands
- No build step. Open `index.html` directly in a browser.
- Optional local server if you want a stable origin for browser APIs:
  - `python -m http.server` (open `http://localhost:8000/`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces (HTML/CSS/JS).
- Naming: `camelCase` for variables/functions, `PascalCase` for classes, `kebab-case` for CSS classes.
- Keep layers separated (domain/data/use-case/UI) and keep UI logic in `ProjectIdeaUI`.
- When adding user-provided text to HTML, use `escapeHtml()` to avoid injection issues.
- Prefer small, readable helpers over large inline blocks.

## Testing Guidelines
- No automated tests configured.
- Manual checks to run after changes:
  - Create project, add/edit/delete ideas, drag to reorder.
  - Toggle done and confirm progress and log updates.
  - Reload to confirm finished timestamps clear but ideas persist (LocalStorage).
  - Verify light/dark toggle and background animation.

## Commit & Pull Request Guidelines
- No Git history is present; if you initialize Git, use clear, imperative messages (e.g., "Add idea edit dialog").
- Keep changes focused; include a short summary and screenshots for UI changes.
- Note any manual checks performed.

## Configuration & Data Notes
- Data is stored in LocalStorage under `project-idea-collection.v1`.
- Theme preference is stored under `project-idea-collection.theme`.
- The app is auth-free and demo-focused; avoid adding network calls unless explicitly required.
