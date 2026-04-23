import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';

const store = new Store();

ipcMain.handle('open-folder', async (_, folderPath) => {
  console.log('open-folder:', folderPath);
  return await shell.openPath(folderPath);
});

ipcMain.handle('open-url', async (_, url) => {
  console.log('open-url:', url);
  return await shell.openExternal(url);
});

ipcMain.handle('focus-window', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    return false;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
  return window.isFocused();
});

ipcMain.handle('store-get-notes', async () => {
  const notes = store.get('calendarNotes', {});
  return notes;
});

ipcMain.handle('store-set-note', async (_, key, note) => {
  const notes = store.get('calendarNotes', {});
  notes[key] = note;
  store.set('calendarNotes', notes);
});

ipcMain.handle('store-delete-note', async (_, key) => {
  const notes = store.get('calendarNotes', {});
  delete notes[key];
  store.set('calendarNotes', notes);
});

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
