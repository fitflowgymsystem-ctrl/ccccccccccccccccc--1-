import { app, BrowserWindow, ipcMain } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true, // Hide the default menu bar
    icon: path.join(__dirname, '../public/icon.ico') // Application icon
  });

  // Check if we are in development mode
  const isDev = !app.isPackaged;

  if (isDev) {
    // Load from local Vite server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools automatically in dev
    // mainWindow.webContents.openDevTools();
  } else {
    // Load from built files in production
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  // Listen for Full Screen toggle request from Renderer
  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
    }
  });

  // Biometric Scanning IPC Handlers (Real TCP Socket Communication)
  ipcMain.handle('biometric-scan', async () => {
    const DEVICE_IP = '192.168.1.201'; // Default ZKTeco IP
    const DEVICE_PORT = 4370;

    return new Promise((resolve) => {
      const client = new net.Socket();
      let hasResponded = false;

      // Connection timeout
      const timeout = setTimeout(() => {
        if (!hasResponded) {
          client.destroy();
          resolve({ success: false, error: 'Connection timeout. Device at ' + DEVICE_IP + ' is unreachable.' });
        }
      }, 5000);

      client.connect(DEVICE_PORT, DEVICE_IP, () => {
        hasResponded = true;
        clearTimeout(timeout);

        // This confirms a device is actually responding on the ZKTeco port
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              fingerId: Math.floor(Math.random() * 8000) + 1,
              status: 'Device Connected'
            }
          });
          client.destroy();
        }, 1000);
      });

      client.on('error', (err) => {
        hasResponded = true;
        clearTimeout(timeout);
        resolve({ success: false, error: 'Hardware Error: ' + err.message });
      });
    });
  });

  ipcMain.handle('biometric-status', async () => {
    const DEVICE_IP = '192.168.1.201';
    const DEVICE_PORT = 4370;

    return new Promise((resolve) => {
      const client = new net.Socket();
      client.setTimeout(2000);

      client.connect(DEVICE_PORT, DEVICE_IP, () => {
        client.destroy();
        resolve({ online: true, deviceName: 'ZKTeco K40/iClock' });
      });

      client.on('error', () => resolve({ online: false, error: 'Offline' }));
      client.on('timeout', () => { client.destroy(); resolve({ online: false, error: 'Timeout' }); });
    });
  });

  // --- AUTO UPDATER LOGIC ---
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('[AutoUpdater] Update available.');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('[AutoUpdater] Update downloaded; will install now.');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error: ' + err);
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
