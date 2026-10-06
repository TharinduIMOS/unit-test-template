# IMOS Results Studio

A standalone, browser-based poster editor. No account, API key, backend, build step, or external runtime service is required. Fonts and template images are included.

## Included sections

- Unit Test: Top 10 results, bulk paste names/schools/marks, unit number and title.
- Tute Test: ranked results and up to three units.
- Today / Tomorrow Post: Sinhala and English, photo upload, editable grade/unit/day/time, position/size/alignment controls.
- Result Template: photo upload with crop controls, editable white/yellow text, result label presets and custom labels.
- Six Isi Sinhala fonts, automatic Sinhala conversion and high-resolution PNG export.
- Clean teacher nameplates in the Today / Tomorrow template.

## Publish on GitHub Pages

1. Extract this ZIP.
2. Upload its contents to the root of your GitHub repository. Keep `index.html` at the root, with `assets/` beside it.
3. Open the repository's Settings → Pages.
4. Select Deploy from a branch, choose your branch (usually `main`) and `/ (root)`, then Save.
5. Open the published Pages link after deployment completes.

No npm install or build command is needed. Relative asset paths support repository Pages URLs.

## Run locally

Use a local web server so fonts, template images and canvas exports load consistently:

```sh
python -m http.server 8000
```

Then open http://localhost:8000 in a modern browser. Keep all files together.

## Editing and privacy

All editing and photo processing happens in your browser. Uploaded photos are not sent to a server. Edits last only for the current tab; download your PNG before closing or refreshing. Image uploads support PNG, JPEG and WebP up to 15 MB.

## Files

- `index.html`: interface
- `styles.css`: layout and bundled font declarations
- `app.js`: Unit Test and Tute Test editor
- `class-post.js`: Today / Tomorrow editor
- `result-template.js`: Result Template editor
- `title-layout.js`: Sinhala text conversion and title fitting
- `assets/`: templates, fonts and applicable mapping license

Keep the supplied mapping license with the source. Template images and Isi fonts were supplied for this project; use these assets only where you have permission. No blanket license is assigned to them.
