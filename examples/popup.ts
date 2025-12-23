import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { tomateMods } from 'setup';

function windowPopup(options?: BrowserWindowConstructorOptions) {
  return new BrowserWindow({
    webPreferences: {
      sandbox: true,
      safeDialogs: true,
      nodeIntegration: false,
    },
    ...options,
  });
}

async function downloadPopup(url: string, savePath: string) {
  const downloadWindow = windowPopup();

  const { session } = downloadWindow.webContents;
  await downloadWindow.webContents.loadURL(url);

  try {
    await new Promise<void>((resolve, reject) => {
      session.on('will-download', (_event, item) => {
        item.pause();

        item.setSavePath(
          process.platform === 'win32'
            ? savePath.replaceAll('/', '\\')
            : savePath
        );

        item.on('done', () => {
          resolve();
        });

        item.on('updated', (__event, state) => {
          if (state === 'interrupted') reject();

          console.error('Download state:', state);
        });
      });

      setTimeout(() => {
        reject();
      }, 600000); // 10 Minutes timeout
    });
  } finally {
    downloadWindow.close();
  }
}

const provider = tomateMods.provider('modrinth');

const version = await provider.version('boids', 'WKjzEyfQ');
await provider.download(version, './boids.jar', { popup: downloadPopup });
