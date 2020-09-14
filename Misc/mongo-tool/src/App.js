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
  const [mongoStatus, setMongoStatus] = useState({ connected: false, uri: 'mongodb://root:password@masterkenth-test.com:27017/files?authSource=admin' })
  const [files, setFiles] = useState([])
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
    callIpc('mongo-connect', { uri: mongoStatus.uri }, `Connecting to ${mongoStatus.uri}`, (res) => {
      setMongoStatus(p => ({ ...p, connected: !res.error }))
      if (!res.error) {
        callRefresh()
      }
    })
  }

  const callRefresh = () => {
    callIpc('mongo-list', null, 'Refreshing list', (res) => {
      setFiles(res)
      console.log(res)
    })
  }

  const handleConnectInput = (e) => {
    const value = e.currentTarget.value
    setMongoStatus(p => ({ ...p, uri: value }))
  }

  const handleRename = (file, newFilename) => {
    callIpc('mongo-rename', { id: file.file.id, newFilename: newFilename }, 'Renaming', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefresh()
      }
    })
  }

  const handleDelete = (files) => {
    callIpc('mongo-delete', { files: files.map(f => f.file.id) }, 'Deleting', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefresh()
      }
    })
  }

  const gotoBrowser = () => setTab('browser')
  const gotoUpload = () => setTab('upload')
  const gotoNotes = () => setTab('notes')

  const handleUpload = (files) => {
    console.log(files)
    callIpc('mongo-upload', { files: files }, 'Uploading', (res) => {
      console.log(res)
      setInfoText(p => ({ ...p, type: 'err', text: res.error || '' }))
      if (!res.error) {
        callRefresh()
      }
    })
  }

  return (
    <div className={Styles.rootContainer}>
      <LoadingOverlay visible={loading.visible} text={loading.text} />
      <div className={Styles.actionBar}
        sx={{ gap: 1, p: 1 }}
      >
        <input
          type="Text"
          placeholder="mongodb://<user>:<password>@<host>:<port>/<db>?authSource=<authdb>"
          value={mongoStatus.uri}
          onChange={handleConnectInput}
          spellCheck={false}
        />
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
          { tab === 'notes' && <Notes />}
        </div>
      </div>

    </div>
  )
}

export default App
