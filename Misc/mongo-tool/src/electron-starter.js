const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const fsp = fs.promises
const mongoose = require('mongoose')
const { createModel } = require('mongoose-gridfs')
const path = require('path')

let mainWindow

let dbConFiles = null
let dbConMain = null
let gridfsModel = null
let NotesModel = null

const notesModelObj = {
  _id: String,
  hidden: Boolean,
  title: String,
  desc: String,
  uploadDate: Date,
  imageKey: String,
  tags: [String],
  body: String
}

function registerSchemaAndGetModel (dbCon, modelName, schemaObj) {
  const schema = new mongoose.Schema(schemaObj)
  const model = dbCon.model(modelName, schema)
  console.log(`registered model ${dbCon.name}::${modelName}`)
  return model
}

function getAllEntries (dbCon, modelName) {
  return new Promise((resolve, reject) => {
    console.log(`getAllEntries ${dbCon.name}::${modelName}`)
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

function connectToDB (dbName) {
  console.log(`Connecting to ${dbName}`)
  return mongoose.createConnection(`mongodb://root:password@masterkenth-test.com:27017/${dbName}?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
}

ipcMain.on('mongo-connect', (event, arg) => {
  console.log('mongo-connect')
  connectToDB('files')
    .then((con) => {
      dbConFiles = con
      gridfsModel = createModel({
        modelName: 'File',
        connection: dbConFiles
      })
    })
    .then(() => connectToDB('main'))
    .then((con) => {
      dbConMain = con
      NotesModel = registerSchemaAndGetModel(con, 'Note', notesModelObj)
    })
    .then(() => {
      console.log('mongo-connect connected')
      event.reply('mongo-connect', {})
    }).catch((e) => {
      console.log('mongo-connect error')
      console.log(e)
      event.reply('mongo-connect', { error: e.toString() })
    })
})

ipcMain.on('mongo-files-list', (event, arg) => {
  getAllEntries(dbConFiles, 'File')
    .then((res) => event.reply('mongo-files-list', res))
    .catch((e) => event.reply('mongo-files-list', { error: e }))
})

ipcMain.on('mongo-files-rename', (event, arg) => {
  const { id, newFilename } = arg
  console.log(`rename id=${id} new=${newFilename}`)
  dbConFiles.model('File').updateOne({ _id: id }, { filename: newFilename })
    .then((res) => {
      console.log(`mongo-files-rename got ${res}`)
      console.log(res)
      event.reply('mongo-files-rename', {})
    })
    .catch((e) => {
      console.log(`mongo-files-rename error ${e}`)
      event.reply('mongo-files-rename', { error: e.toString() })
    })
})

ipcMain.on('mongo-files-upload', (event, arg) => {
  const { files } = arg
  console.log(`mongo-files-upload ${files.length} files`)
  console.log(files.map(f => `\t${f.filePath}`).join('\n'))
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
      event.reply('mongo-files-upload', {})
    })
    .catch((e) => {
      event.reply('mongo-files-upload', { error: e.toString() })
    })
})

ipcMain.on('mongo-files-delete', (event, arg) => {
  const { files } = arg
  console.log(`mongo-files-delete ${files.join(', ')}`)
  const promises = []
  for (let i = 0; i < files.length; i++) {
    const id = files[i]
    promises.push(new Promise((resolve, reject) => {
      gridfsModel.unlink(id, (err) => {
        console.log(`mongo-files-delete error=${err}`)
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
      event.reply('mongo-files-delete', {})
    })
    .catch((e) => {
      event.reply('mongo-files-delete', { error: e.toString() })
    })
})

ipcMain.on('mongo-notes-list', (event, arg) => {
  getAllEntries(dbConMain, 'Note')
    .then((res) => event.reply('mongo-notes-list', res))
    .catch((e) => event.reply('mongo-notes-list', { error: e }))
})

ipcMain.on('mongo-note-upload', async (event, arg) => {
  const noteData = {
    ...arg,
    _id: arg.id,
    body: await fsp.readFile(arg._meta.path, 'utf-8'),
    uploadDate: new Date()
  }

  let p = null
  if (arg._meta.update) {
    p = NotesModel.findByIdAndUpdate(noteData._id, noteData)
  } else {
    const note = new NotesModel(noteData)
    p = note.save()
  }

  p
    .then(() => event.reply('mongo-note-upload', {}))
    .catch((e) => {
      console.log(`mongo-note-upload error=${e.toString()}`)
      event.reply('mongo-note-upload', { error: e.toString() })
    })
})

ipcMain.on('mongo-note-download', (event, arg) => {
  const note = arg
  dialog.showSaveDialog(mainWindow, {
    title: `Save note ${note.id}`,
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
    .then((filepath) => {
      console.log(filepath)
      return filepath.canceled ? Promise.resolve() : fsp.writeFile(filepath.filePath, note.body, { encoding: 'utf-8' })
    })
    .then(() => event.reply('mongo-note-download', {}))
    .catch((e) => event.reply('mongo-note-download', { error: e }))
})

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
