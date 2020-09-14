/** @jsx jsx */
import React, { useState, useEffect } from 'react'
import { jsx } from 'theme-ui'
import Styles from './App.module.scss'
import InfoText from './components/InfoText'
import LoadingOverlay from './components/LoadingOverlay'
import Browser from './components/Browser'
import UploadForm from './components/UploadForm'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

function App () {
  const [infoText, setInfoText] = useState({ type: 'warn', text: '' })
  const [loading, setLoading] = useState({ visible: false, text: '' })
  const [mongoStatus, setMongoStatus] = useState({ connected: false, uri: 'mongodb://root:password@masterkenth-test.com:27017/files?authSource=admin' })
  const [files, setFiles] = useState([])
  const [tab, setTab] = useState('browser')

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

  const handleUpload = (formValues) => {
    const { key, contentType, filePath } = formValues
    callIpc('mongo-upload', { key: key, filepath: filePath, type: contentType }, 'Uploading', (res) => {
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
        <div className={Styles.tabs}>
          <button disabled={tab === 'browser'} onClick={gotoBrowser}>
            B
          </button>
          <button disabled={tab === 'upload'} onClick={gotoUpload}>
            U
          </button>
        </div>
      </div>

      { tab === 'browser' && <Browser
        files={files}
        onRename={handleRename}
        onDelete={handleDelete}
      /> }
      { tab === 'upload' && <UploadForm
        disabled={!mongoStatus.connected}
        onUpload={handleUpload}
      />}
    </div>
  )
}

export default App

// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import { BrowserRouter, Route /* Link */ } from 'react-router-dom'
// import Styles from './App.module.scss'
// import classNames from 'classnames'
// import { ReactComponent as LoaderImage } from './loader.svg'
//
// const electron = window.require('electron')
// const ipcRenderer = electron.ipcRenderer
//
// function bytesToString (bytes) {
//   if (bytes < 1000) { return `${bytes} bytes` } else if (bytes < 1000 * 1000) { return `${bytes / 1000} Kb` } else { return `${bytes / 1000 / 1000} Mb` }
// }
//
// function simpleDateStringFormat (dateString) {
//   return dateString.substring(0, dateString.lastIndexOf('.')).replace('T', ' ')
// }
//
// function App () {
//   const [pendingActivities, setPendingActivities] = useState({ activities: [] })
//
//   const [mongoStatus, setMongoStatus] = useState({
//     statusText: 'Not Connected...',
//     statusClass: Styles.notConnected,
//     statusHint: null,
//     showingHint: false,
//     connectionString: 'mongodb://root:password@masterkenth-test.com:27017/files?authSource=admin',
//     connected: false,
//     refreshing: false
//   })
//
//   const [mongoData, setMongoData] = useState({
//     entries: [
//       /* {
//         key: 'somekey.jpg',
//         size: 1234567,
//         selected: false
//       }, {
//         key: 'somepath/somedir/somekey.pdf',
//         size: 800,
//         selected: false
//       }, {
//         key: 'oof',
//         size: 4000,
//         selected: false
//       }, {
//         key: 'main/profile/thumbnails/fiery-landscape-600x600.png',
//         size: 123456789,
//         selected: false
//       }, {
//         key: '.hiddenfile',
//         size: 133700,
//         selected: false
//       }, {
//         key: '.multi.ext',
//         size: 133700,
//         selected: false
//       }, {
//         key: 'asd/.hiddenfile2',
//         size: 133700,
//         selected: false
//       }, {
//         key: 'asd/deep/.multi.2',
//         size: 133700,
//         selected: false
//       } */]/* .map((v, i) => {
//       const lastSlash = v.key.lastIndexOf('/')
//       const filename = lastSlash >= 0 ? v.key.substring(lastSlash + 1) : v.key
//       const firstDot = filename.indexOf('.')
//       const ext = firstDot >= 0 ? filename.substring(firstDot) : filename[0] === '.' ? filename : null
//       return { ...v, ext: ext }
//     }) */
//   })
//
//   const [contextMenuData, setContextMenuData] = useState({
//     currentFileIndex: -1,
//     visible: false,
//     x: 0,
//     y: 0,
//     renaming: false,
//     renamingvalue: '',
//     renameX: 0,
//     renameY: 0
//   })
//
//   const [uploadData, setUploadData] = useState({
//     dialogVisible: false,
//     key: '',
//     type: '',
//     datauri: null,
//     error: 'big oof'
//   })
//
//   const renameInputEl = useRef(null)
//   const uploadInputEl = useRef(null)
//
//   const popPendingActivity = useCallback((id) => {
//     setPendingActivities((prev) => ({ ...prev, activities: prev.activities.filter(v => v.id !== id) }))
//   }, [])
//
//   const addPendingActivity = useCallback((id, desc) => {
//     setPendingActivities((prev) => ({ ...prev, activities: prev.activities.concat([{ id: id, desc: desc }]) }))
//   }, [])
//
//   const connectToDb = useCallback(() => {
//     setMongoStatus((prev) => ({ ...prev, statusText: 'Connecting...', statusHint: null, statusClass: Styles.notConnected }))
//     addPendingActivity('connect', 'Connecting to db')
//     ipcRenderer.send('mongo-connect', mongoStatus.connectionString)
//   }, [mongoStatus.connectionString, addPendingActivity])
//
//   const refreshEntries = useCallback(() => {
//     setMongoStatus((prev) => ({ ...prev, refreshing: true }))
//     ipcRenderer.send('mongo-list', mongoStatus.connectionString)
//   }, [mongoStatus.connectionString])
//
//   const toggleFileSelected = useCallback((i) => {
//     const entries = mongoData.entries
//     entries[i].selected = !entries[i].selected
//     setMongoData((prev) => ({ ...prev, entries: entries }))
//   }, [mongoData.entries])
//
//   const openContextMenuForEntry = useCallback((event, i) => {
//     /* const width = document.body.clientWidth
//     const height = document.body.clientHeight */
//     const x = event.pageX
//     const y = event.pageY
//     setContextMenuData((prev) => ({ ...prev, currentFileIndex: i, visible: true, x: x, y: y }))
//   }, [])
//
//   const closeContextMenu = useCallback(() => {
//     setContextMenuData((prev) => ({ ...prev, visible: false, renaming: false }))
//   }, [])
//
//   const downloadEntry = useCallback(() => {
//     closeContextMenu()
//   }, [closeContextMenu])
//
//   const beginRenameEntry = useCallback((event) => {
//     closeContextMenu()
//     const x = event.pageX - 5
//     const y = event.pageY - 5
//     setContextMenuData((prev) => ({
//       ...prev,
//       renaming: true,
//       renamingvalue: mongoData.entries[contextMenuData.currentFileIndex].key,
//       renameX: x,
//       renameY: y
//     }))
//     renameInputEl.current.focus()
//   }, [closeContextMenu, contextMenuData.currentFileIndex, mongoData.entries])
//
//   const stopRenaming = useCallback(() => {
//     setContextMenuData((prev) => ({ ...prev, renaming: false }))
//   }, [])
//
//   const finishRenameEntry = useCallback(() => {
//     closeContextMenu()
//   }, [closeContextMenu])
//
//   const copyURLEntry = useCallback(() => {
//     closeContextMenu()
//     const entry = mongoData.entries[contextMenuData.currentFileIndex]
//     electron.clipboard.writeText(`https://api.masterkenth.com/_files/${entry.key}`)
//   }, [closeContextMenu, contextMenuData.currentFileIndex, mongoData.entries])
//
//   const deleteEntry = useCallback(() => {
//     closeContextMenu()
//   }, [closeContextMenu])
//
//   const uploadFile = useCallback(() => {
//     const filepath = uploadInputEl.current.files[0].path
//     setUploadData((prev) => ({ ...prev, error: null }))
//     ipcRenderer.send('mongo-upload', { key: uploadData.key, filepath: filepath, type: uploadData.type })
//     addPendingActivity('upload', 'uploading file')
//   }, [uploadData.key, uploadData.type, addPendingActivity])
//
//   const loadUploadPreview = useCallback((e) => {
//     if (uploadInputEl.current.files.length > 0) {
//       const file = uploadInputEl.current.files[0]
//       setUploadData((prev) => ({ ...prev, type: file.type }))
//       const fileReader = new FileReader()
//       fileReader.onloadend = (ev) => {
//         const datauri = ev.currentTarget.result
//         setUploadData((prev) => ({ ...prev, datauri: datauri }))
//       }
//       fileReader.readAsDataURL(file)
//     } else {
//       setUploadData((prev) => ({ ...prev, datauri: null }))
//     }
//   }, [])
//
//   useEffect(() => {
//     ipcRenderer.on('mongo-connect', (event, arg) => {
//       console.log(arg)
//       if (!arg) {
//         setMongoStatus((prev) => ({ ...prev, connected: true, statusText: 'Connected to localhost:1234', statusHint: null, statusClass: Styles.connected }))
//       } else {
//         setMongoStatus((prev) => ({ ...prev, connected: false, statusText: 'Error*', statusHint: arg, statusClass: Styles.error }))
//       }
//       popPendingActivity('connect')
//     })
//
//     ipcRenderer.on('mongo-list', (event, arg) => {
//       const data = JSON.parse(arg)
//       console.log(data)
//       setMongoStatus((prev) => ({ ...prev, refreshing: false }))
//       setMongoData((prev) => ({
//         ...prev,
//         entries: data.map(d => ({
//           id: d._id,
//           key: d.filename,
//           size: d.length,
//           uploadDate: d.uploadDate,
//           contentType: d.contentType || (d.metadata ? d.metadata.contentType : null),
//           selected: false
//         })).map((v, i) => {
//           /** calculate extensions */
//           const lastSlash = v.key.lastIndexOf('/')
//           const filename = lastSlash >= 0 ? v.key.substring(lastSlash + 1) : v.key
//           const firstDot = filename.indexOf('.')
//           const ext = firstDot >= 0 ? filename.substring(firstDot) : filename[0] === '.' ? filename : null
//           return { ...v, ext: ext }
//         })
//       }))
//     })
//
//     ipcRenderer.on('mongo-upload', (event, arg) => {
//       popPendingActivity('upload')
//       if (arg) {
//         setUploadData((prev) => ({ ...prev, error: arg }))
//       } else {
//         setUploadData((prev) => ({ ...prev, dialogVisible: false }))
//         refreshEntries()
//       }
//     })
//   }, [popPendingActivity, refreshEntries])
//
//   return (
//     <BrowserRouter>
//       <Route exact path="/">
//         <>
//           {/** Loading overlay */}
//           <div className={Styles.loadingRoot} style={{ visibility: pendingActivities.activities.length > 0 ? 'visible' : 'collapse' }}>
//             <LoaderImage />
//             <p>{ pendingActivities.activities.length > 0 && pendingActivities.activities[pendingActivities.activities.length - 1].desc }</p>
//           </div>
//           {/** Upload Dialog */}
//           <div className={Styles.uploadRoot} style={{ visibility: uploadData.dialogVisible ? 'visible' : 'collapse' }}>
//             <div className={Styles.inner}>
//               <button className={Styles.closeButton} onClick={() => setUploadData((prev) => ({ ...prev, dialogVisible: false }))}>X</button>
//               <h1>Upload File</h1>
//               <h2>File</h2>
//               <input type='file' ref={uploadInputEl} onChange={loadUploadPreview} />
//               <h2>Key</h2>
//               <input type='text' value={uploadData.key} onChange={(e) => { const v = e.target.value; setUploadData((prev) => ({ ...prev, key: v })) }} />
//               <button onClick={uploadFile} disabled={uploadData.key.length === 0 || uploadInputEl.current.files.length === 0}>Upload</button>
//               <img src={uploadData.datauri} alt='' />
//               <span className={Styles.error}>{uploadData.error}</span>
//             </div>
//           </div>
//           {/** Context Menu */}
//           <div className={Styles.contextMenuRoot} style={{ visibility: contextMenuData.visible ? 'visible' : 'collapse' }}>
//             <div className={Styles.backdrop} onClick={closeContextMenu} onContextMenu={closeContextMenu}></div>
//             <div className={Styles.visibleRoot} style={{ top: contextMenuData.y, left: contextMenuData.x }}>
//               <span onClick={downloadEntry}>Download</span>
//               <span onClick={(e) => beginRenameEntry(e)}>Rename</span>
//               <span onClick={copyURLEntry}>Copy REST URL</span>
//               <span className={Styles.info}>&nbsp;</span>
//               <span onClick={deleteEntry} className={Styles.dangerous}>Delete</span>
//               <span className={Styles.info}>&nbsp;</span>
//               <span className={Styles.info}>{contextMenuData.currentFileIndex >= 0 && mongoData.entries[contextMenuData.currentFileIndex].contentType}</span>
//               <span className={Styles.info}>{contextMenuData.currentFileIndex >= 0 && simpleDateStringFormat(mongoData.entries[contextMenuData.currentFileIndex].uploadDate)}</span>
//               <span className={Styles.info}>{contextMenuData.currentFileIndex >= 0 && bytesToString(mongoData.entries[contextMenuData.currentFileIndex].size)}</span>
//               <span className={Styles.info}>{contextMenuData.currentFileIndex >= 0 && mongoData.entries[contextMenuData.currentFileIndex].id}</span>
//             </div>
//             {/** Rename Input */}
//             <div className={classNames(Styles.backdrop, Styles.rename)} onClick={stopRenaming} onContextMenu={stopRenaming} style={{ visibility: contextMenuData.renaming ? 'visible' : 'collapse' }}></div>
//             <div className={Styles.renameRoot} style={{ visibility: contextMenuData.renaming ? 'visible' : 'collapse', top: contextMenuData.renameY, left: contextMenuData.renameX }}>
//               <input type="text" ref={renameInputEl}
//                 value={contextMenuData.renamingvalue}
//                 onChange={(e) => { setContextMenuData((prev) => ({ ...prev, renamingvalue: e.target.value })) }}
//                 onKeyUp={(e) => { if (e.key === 'Enter' && e.target.value.length > 0) finishRenameEntry() }}></input>
//             </div>
//           </div>
//           {/** Main */}
//           <div className={Styles.root}>
//             <div className={Styles.topBar}>
//               <input type="text"
//                 placeholder="mongodb://<user>:<password>@<host>:<port>/<db>?authSource=<authdb>"
//                 value={mongoStatus.connectionString}
//                 onChange={(e) => { setMongoStatus((prev) => ({ ...prev, connectionString: e.target.value })) }}></input>
//               <button onClick={connectToDb} disabled={!mongoStatus.connectionString || mongoStatus.connectionString.length <= 0}>Connect</button>
//               <div className={Styles.statusTextRoot}>
//                 <span
//                   onMouseEnter={() => { setMongoStatus((prev) => ({ ...prev, showingHint: true })) }}
//                   onMouseLeave={() => { setMongoStatus((prev) => ({ ...prev, showingHint: false })) }}
//                   className={mongoStatus.statusClass}>{mongoStatus.statusText}</span>
//                 <div className={Styles.hintRoot} style={{ visibility: mongoStatus.showingHint && mongoStatus.statusHint != null ? 'visible' : 'collapse' }}>
//                   <span>{mongoStatus.statusHint}</span>
//                 </div>
//               </div>
//               <div className={Styles.spacer} />
//               <button onClick={() => setUploadData((prev) => ({ ...prev, dialogVisible: true }))} disabled={!mongoStatus.connected}>Upload</button>
//             </div>
//             <div className={Styles.viewer}>
//               <div className={Styles.actions}>
//                 <button onClick={refreshEntries} disabled={!mongoStatus.connected || mongoStatus.refreshing}>{mongoStatus.refreshing ? 'Refreshing...' : 'Refresh'}</button>
//                 <button className={Styles.dangerous} disabled={!mongoStatus.connected || mongoData.entries.filter(e => e.selected).length <= 0}>Delete Selected ({mongoData.entries.filter(e => e.selected).length})</button>
//                 <div className={Styles.spacer} />
//                 <span>{mongoData.entries.length === 1 ? '1 file' : `${mongoData.entries.length} files`}</span>
//               </div>
//               <div className={Styles.viewBox}>
//                 { mongoData.entries/* Array(50).fill({ key: 'lorem ipsum dolar sitem dot jpäg', selected: false, ext: '.txt' }) */.map((entry, i) =>
//                   (<div key={entry.key} className={classNames(Styles.imageEntry, entry.selected || (contextMenuData.visible && contextMenuData.currentFileIndex === i) ? Styles.selected : null)}>
//                     <div className={Styles.selectionMarker}>{entry.selected ? '☑' : '☐'}</div>
//                     <div onClick={() => toggleFileSelected(i)} onContextMenu={(e) => openContextMenuForEntry(e, i)} className={Styles.imageBox}>
//                       <span className={Styles.extText}>{entry.ext}</span>
//                     </div>
//                     <div className={Styles.text}>
//                       <span>{entry.key}</span>
//                     </div>
//                   </div>)
//                 ) }
//               </div>
//             </div>
//           </div>
//         </></Route>
//     </BrowserRouter>
//   )
// }
//
// export default App
