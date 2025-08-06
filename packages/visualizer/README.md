# @callstack/license-kit-visualizer

This is a project that is used to build a visualizer app displaying a visualization of the dependency graph along with licenses, graphs & summaries. Supports drag-and-drop of JSON report from `license-kit` or live load/reload via server-sent events (SSE) from the `license-kit visualize` server.

Private license-kit package only for the needs of that workspace.

The visualizer is configured to build to `../visualizer-build`, from where the CLI picks it to pack along with the NPM tarball. In production mode, a `next.config.js` from the CLI is used to build this project with additional tweaks.

## Build pipeline

## Development

First, run the development server: `yarn dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production build

To export the project as HTML, run `yarn build`
