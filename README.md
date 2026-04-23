# ConviGUI

ConviGUI is a small Electron desktop app built with Vue 3. It currently combines two utilities in a single window:

- a link launcher for opening folders, files, and URLs
- a calendar for storing color-coded day notes

The project uses Electron Forge + Vite for development and packaging.

## Features

### Links tab

- Displays shortcut groups defined in `src/storage/links.js`
- Opens folders and files through Electron shell APIs
- Opens web links in the default browser
- Supports drag-and-drop reordering inside a group during the current session

### Calendar tab

- Month view and compact year view
- Click a day to create or edit a note
- Per-note color selection
- Notes are persisted with `electron-store`

## Tech Stack

- Electron
- Vue 3
- Vite
- Electron Forge
- `electron-store`
- `vuedraggable`

## Project Structure

```text
.
├── css/
│   ├── calendar.css
│   └── linkconsole.css
├── src/
│   ├── components/
│   │   ├── Calendar.vue
│   │   └── LinkConsole.vue
│   ├── storage/
│   │   └── links.js
│   ├── App.vue
│   ├── main.js
│   ├── preload.js
│   ├── renderer.js
│   └── index.css
├── forge.config.js
├── package.json
└── vite.*.config.mjs
```

## How It Works

### Electron side

- `src/main.js` creates the main window
- IPC handlers expose file opening, URL opening, window focusing, and calendar note storage
- Notes are stored through `electron-store`

### Renderer side

- `src/App.vue` switches between the Links and Calendar tabs
- `src/components/LinkConsole.vue` renders shortcut groups from static source data
- `src/components/Calendar.vue` handles calendar generation, note editing, and note persistence

### Preload bridge

`src/preload.js` exposes a small `window.api` surface to the renderer:

- `openFolder(path)`
- `openUrl(url)`
- `focusWindow()`
- `getNotes()`
- `setNote(key, note)`
- `deleteNote(key)`

## Requirements

Tested in development with:

- Node.js 22
- npm 11

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app in development mode

```bash
npm start
```

This launches Electron through Electron Forge and starts the Vite dev server for the renderer process.

## Available Scripts

- `npm start` - run the app locally in development mode
- `npm run package` - build a packaged application without creating installers
- `npm run make` - build platform-specific distributables configured in `forge.config.js`
- `npm run publish` - publish packaged artifacts through Electron Forge
- `npm run lint` - placeholder script; no real linting is configured yet

## Configuring the Links Tab

Shortcut groups are defined in `src/storage/links.js`.

Current shape:

```js
const groups = [
  {
    type: "folder", // "folder" | "file" | "url"
    items: [
      { id: 1, name: "Example", path: "/absolute/path/or/url" }
    ]
  }
];
```

### Notes

- `type` is set at the group level
- `path` should be an absolute filesystem path for `folder` and `file`
- `path` should be a full URL for `url`
- `id` is used for ordering and drag list identity

After editing `src/storage/links.js`, restart the development server if it is already running.

## Calendar Data Storage

Calendar notes are stored with `electron-store` under the app's user data directory.

Example on Linux:

```text
~/.config/convigui/config.json
```

Each note is stored under a `YYYY-MM-DD` key with this shape:

```json
{
  "text": "Reminder",
  "color": "#FFD93D"
}
```

## Packaging

Packaging is managed by Electron Forge.

- `npm run package` produces a packaged app
- `npm run make` creates installers/packages for the makers configured in `forge.config.js`

Current makers:

- Squirrel.Windows
- ZIP for macOS
- DEB
- RPM

## Current Limitations

- Link entries are static source code, not user-editable from the UI
- Link order changes are not persisted between app launches
- There is no automated test suite
- There is no real lint or formatting pipeline configured
- Some UI copy is mixed between English and Russian
- Some legacy or unused component files are still present in the repository

## Suggested Next Steps

- Move link configuration out of source code into persisted app data
- Persist drag-and-drop order for launcher items
- Add linting and at least a small smoke-test workflow
- Clean up unused component files
- Make package metadata and branding production-ready

## License

MIT
