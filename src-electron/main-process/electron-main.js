import { app, BrowserWindow, ipcMain } from 'electron'
const nativeImage = require('electron').nativeImage
const path = require('path')
const http = require('http')
const express = require('express')
const expressApp = express()
const cors = require('cors')
const router = express.Router()

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

// get the icon path as per installed app
const iconPath = path.join(__dirname, '/../icons/512x512.png')
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
      webSecurity: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

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
  let filename = fileFolder + path.sep + req.params.name
  console.log('Serving file:', filename)
  res.sendFile(filename)
})

expressApp.use('/', router)

http.createServer(expressApp).listen(8000)
