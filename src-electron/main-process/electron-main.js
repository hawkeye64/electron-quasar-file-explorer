import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
const nativeImage = require('electron').nativeImage
const path = require('path')
const http = require('http')
const express = require('express')
const expressApp = express()
const cors = require('cors')
const router = express.Router()

// initialize 'remote'
require('@electron/remote/main').initialize()

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
}
catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

// get the icon path as per installed app
const iconPath = path.join(__dirname, '/../icons/linux-512x512.png')
// create the appIcon
const appIcon = nativeImage.createFromPath(iconPath)
// appIcon.setTemplateImage(true)

let mainWindow
let fileFolder

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: appIcon, // use appIcon generated above
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')

      // allowRunningInsecureContent: true,
      worldSafeExecuteJavaScript: true,
      contextIsolation: false,

      enableRemoteModule: true,

      webSecurity: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// app.on('ready', createWindow)
app.on('ready', () => {
  createWindow()
  const { session } = require('electron')
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // eslint-disable-next-line standard/no-callback-literal
    callback({
      responseHeaders: 'default-src http: ws:'
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('folder', (event, folder) => {
  fileFolder = folder
})

expressApp.use(cors())

router.get('/file/:name', function (req, res) {
  const filename = fileFolder + path.sep + req.params.name
  res.sendFile(filename)
})

expressApp.use('/', router)

http.createServer(expressApp).listen(8000)
