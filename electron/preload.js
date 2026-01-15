
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose specific capabilities here
  toggleFullScreen: () => ipcRenderer.send('toggle-fullscreen'),
  scanBiometric: () => ipcRenderer.invoke('biometric-scan'),
  getBiometricStatus: () => ipcRenderer.invoke('biometric-status'),
  isElectron: true
});
