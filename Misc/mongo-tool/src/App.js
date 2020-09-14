/** @jsx jsx */
import React, { useState, useEffect } from 'react'
import { jsx } from 'theme-ui'
import Styles from './App.module.scss'
import InfoText from './components/InfoText'
import LoadingOverlay from './components/LoadingOverlay'
import Browser from './components/Browser'
import UploadForm from './components/UploadForm'
import Notes from './components/Notes'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

function App () {
  const [infoText, setInfoText] = useState({ type: 'warn', text: '' })
  const [loading, setLoading] = useState({ visible: false, text: '' })
  const [mongoStatus, setMongoStatus] = useState({ connected: false })
  const [files, setFiles] = useState([])
  const [notes, setNotes] = useState([])
  const [tab, setTab] = useState('notes')

  const callIpc = (func, data, loadingText, cb) => {
    setLoading(p => ({ ...p, visible: true, text: loadingText }))
    ipcRenderer.once(func, (event, arg) => {
      setInfoText(p => ({ ...p, type: 'err', text: arg.error || '' }))
      setLoading(p => ({ ...p, visible: false }))
      cb(arg)
    })
    ipcRenderer.send(func, data)
  }

  const callConnect = () => {
    callIpc('mongo-connect', { uri: mongoStatus.uri }, 'Connecting', (res) => {
      setMongoStatus(p => ({ ...p, connected: !res.error }))
      if (!res.error) {
        callRefreshFiles()
        callRefreshNotes()
      }
    })
  }

  const callRefreshFiles = () => {
    callIpc('mongo-files-list', null, 'Refreshing list', (res) => {
      setFiles(res)
      console.log(res)
    })
  }

  const callRefreshNotes = () => {
    callIpc('mongo-notes-list', null, 'Refreshing list', (res) => {
      setNotes(res)
      console.log(res)
    })
  }

  const handleRename = (file, newFilename) => {
    callIpc('mongo-files-rename', { id: file.file.id, newFilename: newFilename }, 'Renaming', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefreshFiles()
      }
    })
  }

  const handleDelete = (files) => {
    callIpc('mongo-files-delete', { files: files.map(f => f.file.id) }, 'Deleting', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefreshFiles()
      }
    })
  }

  const gotoBrowser = () => setTab('browser')
  const gotoUpload = () => setTab('upload')
  const gotoNotes = () => setTab('notes')

  const handleUpload = (files) => {
    console.log(files)
    callIpc('mongo-files-upload', { files: files }, 'Uploading', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefreshFiles()
      }
    })
  }

  return (
    <div className={Styles.rootContainer}>
      <LoadingOverlay visible={loading.visible} text={loading.text} />
      <div className={Styles.actionBar}
        sx={{ gap: 1, p: 1 }}
      >
        <button onClick={callConnect}>
          Connect
        </button>
        <InfoText type={mongoStatus.connected ? 'good' : 'warn'} text={mongoStatus.connected ? 'connected' : 'not connected'} />
        <InfoText type={infoText.type} text={infoText.text} />
      </div>
      <div
        className={Styles.content}
        sx={{ gap: 1 }}
      >
        <div
          className={Styles.tabs}
          sx={{ gap: 0 }}
        >
          <button disabled={!mongoStatus.connected || tab === 'browser'} onClick={gotoBrowser}>
            Browser
          </button>
          <button disabled={!mongoStatus.connected || tab === 'upload'} onClick={gotoUpload}>
            Upload
          </button>
          <button disabled={!mongoStatus.connected || tab === 'notes'} onClick={gotoNotes}>
            Notes
          </button>
        </div>
        <div
          className={Styles.tabContent}
          sx={{ gap: 1 }}
        >
          { tab === 'browser' && <Browser
            files={files}
            onRename={handleRename}
            onDelete={handleDelete}
          /> }
          { tab === 'upload' && <UploadForm
            onUpload={handleUpload}
          />}
          { tab === 'notes' && <Notes
            notes={notes}
          />}
        </div>
      </div>

    </div>
  )
}

export default App
