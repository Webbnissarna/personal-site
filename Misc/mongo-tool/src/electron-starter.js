const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const mongoose = require('mongoose')
const { createModel } = require('mongoose-gridfs')
const path = require('path')

let dbCon = null
let gridfsModel = null
let notesModel = null

const notesModelObj = {
  _id: String,
  hidden: Boolean,
  title: String,
  img_key: String,
  desc: String,
  post_date: Date,
  tags: [String],
  body: String
}

function registerSchemaAndGetModel (dbCon, modelName, schemaObj) {
  const schema = new mongoose.Schema(schemaObj)
  const model = dbCon.model(modelName, schema)
  console.log(`registered model ${dbCon.name}::${modelName}`)
  return model
}

function getAllEntries (modelName) {
  return new Promise((resolve, reject) => {
    console.log(`getAllEntries ${modelName}`)
    dbCon.model(modelName).find()
      .then((res) => {
        console.log(`getAllEntries ${modelName} got ${res.length}`)
        resolve(res.map(o => ({ ...o.toObject(), id: o._id.toString() })))
      })
      .catch((e) => {
        console.log(`getAllEntries ${modelName} error: ${e.toString()}`)
        reject(e)
      })
  })
}

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
      notesModel = registerSchemaAndGetModel(dbCon, 'Note', notesModelObj)
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
  getAllEntries('File')
    .then((res) => event.reply('mongo-list', res))
    .catch((e) => event.reply('mongo-list', { error: e }))
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
  const { files } = arg
  console.log(`mongo-upload ${files.length} files`)
  const promises = []
  for (let i = 0; i < files.length; i++) {
    const { key, filePath, contentType } = files[i]
    promises.push(new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath)
      const gridfsOptions = ({ filename: key, contentType: contentType })
      gridfsModel.write(gridfsOptions, readStream, (err, file) => {
        console.log(`upload ${key} error=${err}`)
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
      event.reply('mongo-upload', {})
    })
    .catch((e) => {
      event.reply('mongo-upload', { error: e.toString() })
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

  mainWindow.loadURL('http://localhost:3001')
  /*  mainWindow.loadURL(`file://${path.join(__dirname, '/../build/index.html')}`) */
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
