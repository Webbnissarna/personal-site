const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const mongoose = require('mongoose')
const { createModel } = require('mongoose-gridfs')

let dbCon = null
let gridfsModel = null

async function ensureConnection (connectionString) {
  if (dbCon === null) {
    await mongoose.createConnection(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((c) => {
      dbCon = c

      gridfsModel = createModel({
        modelName: 'File',
        connection: dbCon
      })
    })
  }
}

ipcMain.on('mongo-connect', (event, arg) => {
  console.log(`mongo-connect ${arg.uri}`)
  ensureConnection(arg.uri)
    .then((con) => {
      console.log('mongo-connect connected')
      event.reply('mongo-connect', {})
    }).catch((e) => {
      console.log(`mongo-connect error ${e}`)
      event.reply('mongo-connect', { error: e.toString() })
    })
})

ipcMain.on('mongo-list', (event, arg) => {
  console.log('mongo-list')
  dbCon.model('File').find()
    .then((res) => {
      console.log(`mongo-list got ${res.length}`)
      event.reply('mongo-list', res.map(o => ({ ...o.toObject(), id: o._id.toString() })))
    })
    .catch((e) => {
      console.log(`mongo-list error ${e}`)
      event.reply('mongo-list', { error: e.toString() })
    })
})

ipcMain.on('mongo-rename', (event, arg) => {
  const { id, newFilename } = arg
  console.log(`rename id=${id} new=${newFilename}`)
  dbCon.model('File').updateOne({ _id: id }, { filename: newFilename })
    .then((res) => {
      console.log(`mongo-rename got ${res}`)
      console.log(res)
      event.reply('mongo-rename', {})
    })
    .catch((e) => {
      console.log(`mongo-rename error ${e}`)
      event.reply('mongo-rename', { error: e.toString() })
    })
})

ipcMain.on('mongo-upload', (event, arg) => {
  const { key, filepath, type } = arg
  console.log(`upload key=${key} filepath=${filepath} type=${type}`)
  const readStream = fs.createReadStream(filepath)
  const gridfsOptions = ({ filename: key, contentType: type })
  gridfsModel.write(gridfsOptions, readStream, (err, file) => {
    console.log(`upload ${key} error=${err}`)
    event.reply('mongo-upload', err ? { error: err.toString() } : {})
  })
})

ipcMain.on('mongo-delete', (event, arg) => {
  const { files } = arg
  console.log(`mongo-delete ${files.join(', ')}`)
  const promises = []
  for (let i = 0; i < files.length; i++) {
    const id = files[i]
    promises.push(new Promise((resolve, reject) => {
      gridfsModel.unlink(id, (err) => {
        console.log(`mongo-delete error=${err}`)
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    }))
  }
  Promise.all(promises)
    .then(() => {
      event.reply('mongo-delete', {})
    })
    .catch((e) => {
      event.reply('mongo-delete', { error: e.toString() })
    })
})

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: null, // path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  mainWindow.loadURL('http://localhost:3000')
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
