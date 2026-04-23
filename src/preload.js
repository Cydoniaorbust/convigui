const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  getNotes: () => ipcRenderer.invoke('store-get-notes'),
  setNote: (key, note) => ipcRenderer.invoke('store-set-note', key, note),
  deleteNote: (key) => ipcRenderer.invoke('store-delete-note', key),
});
