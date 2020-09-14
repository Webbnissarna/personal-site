/** @jsx jsx */
import React, { useState, useEffect } from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import path from 'path'
import Styles from './Browser.module.scss'
import _ from 'lodash'
import BrowserFile from './BrowserFile'

const electron = window.require('electron')

function bytesToString (bytes) {
  if (bytes < 1000) { return `${bytes} b` } else if (bytes < 1000 * 1000) { return `${bytes / 1000} Kb` } else { return `${bytes / 1000 / 1000} Mb` }
}

function simpleDateStringFormat (date) {
  const dateString = date.toISOString()
  return dateString.substring(0, dateString.lastIndexOf('.')).replace('T', ' ')
}

export default function Browser ({ files, onRename, onDelete }) {
  const [viewMode, setViewMode] = useState('grid')
  const [dirPath, setDirPath] = useState('/')
  const [sortedFiles, setSortedFiles] = useState([])
  const [numSelected, setNumSelected] = useState(0)
  const [renameString, setRenameString] = useState('')

  useEffect(() => {
    setSortedFiles(files.map(f => ({
      path: '/' + f.filename.substr(0, f.filename.lastIndexOf('/')),
      name: f.filename.substr(f.filename.lastIndexOf('/') + 1),
      file: f,
      selected: false
    })))
    setNumSelected(0)
  }, [files])

  const subFolders = files.reduce((prev, curr) => {
    const n = _.cloneDeep(prev)
    const fileDirs = curr.filename.split('/')
    const parentDirs = fileDirs.slice(0, fileDirs.length - 2)
    for (let i = 0; i < parentDirs.length; i++) {
      const p = '/' + parentDirs.slice(0, i).join('/')
      const a = n[p] || []
      const b = parentDirs[i]
      if (a.indexOf(b) === -1) {
        n[p] = [...a, b]
      }
    }
    const parentDir = '/' + parentDirs.join('/')
    const selfDir = fileDirs.length > 1 ? fileDirs[fileDirs.length - 2] : '/'
    if (parentDir !== '/' || selfDir !== '/') {
      const a = n[parentDir] || []
      if (a.indexOf(selfDir) === -1) {
        n[parentDir] = [...a, selfDir]
      }
    }
    return n
  }, {})

  const gotoSubDir = (subdirName) => setDirPath(p => path.join(p, subdirName))

  const gotoParentDir = () => setDirPath(p => p.substr(0, Math.min(p.lastIndexOf('/') || 1)))

  const handleRenameInput = (e) => setRenameString(e.currentTarget.value)

  const toggleFileSelected = (id) => setSortedFiles(p => {
    const n = _.cloneDeep(p)
    const i = n.findIndex(f => f.file.id === id)
    if (i !== -1) {
      n[i].selected = !n[i].selected
      const selected = n.filter(x => x.selected)
      setNumSelected(selected.length)
      if (selected.length === 1) {
        setRenameString(selected[0].file.filename)
      }
    }
    return n
  })

  const doRename = () => {
    onRename(sortedFiles.find(f => f.selected), renameString)
  }

  const doDelete = () => {
    onDelete(sortedFiles.filter(f => f.selected))
  }

  const copyDownloadUrlToClipboard = () => {
    const f = sortedFiles.find(f => f.selected)
    electron.clipboard.writeText(`https://api.masterkenth.com/_files/${f.file.filename}`)
  }

  const copyDownloadKeyToClipboard = () => {
    const files = sortedFiles.filter(f => f.selected)
    if (files.length === 1) {
      electron.clipboard.writeText(files[0].file.filename)
    } else {
      electron.clipboard.writeText(JSON.stringify(files.map(f => f.file.filename)))
    }
  }

  return (
    <div
      className={Styles.browserRoot}
      sx={{ p: 1, gap: 1 }}
    >
      <div className={Styles.addressBar}>
        <button sx={{ mx: 1 }} onClick={gotoParentDir}>&lt;</button>
        <span sx={{ fontSize: 1 }}>
          (root){dirPath}
        </span>
      </div>
      <div className={Styles.modes}>
        <button disabled={viewMode === 'grid'} onClick={() => setViewMode('grid')}>G</button>
        <button disabled={viewMode === 'list'} onClick={() => setViewMode('list')}>L</button>
      </div>
      <div
        className={classnames(Styles.fileArea, Styles[viewMode])}
        sx={{ gap: 0 }}
      >
        { (subFolders[dirPath] || []).map(f => (
          <BrowserFile key={f} type='dir' filePath={f} viewType={viewMode} onClick={() => gotoSubDir(f)} />
        )) }
        { sortedFiles.filter(f => f.path === dirPath).map(f => (
          <BrowserFile
            key={f.file.id}
            checked={f.selected}
            type='file'
            filePath={f.file.filename}
            additionalColumns={[
              f.file.contentType,
              bytesToString(f.file.length),
              simpleDateStringFormat(f.file.uploadDate),
              f.file.id
            ]}
            viewType={viewMode}
            onClick={() => toggleFileSelected(f.file.id)}
          />
        ))}
      </div>
      <div
        className={Styles.actionArea}
        sx={{ gap: 1 }}
      >
        <span>{numSelected} selected</span>
        <button disabled={numSelected <= 0 || true}><span>Download ({numSelected})</span></button>
        <button disabled={numSelected <= 0} onClick={doDelete}><span>Delete ({numSelected})</span></button>
        <button disabled={numSelected !== 1} onClick={doRename}>Rename</button>
        <input disabled={numSelected !== 1} type='text' value={renameString} onChange={handleRenameInput} />
        <button disabled={numSelected !== 1} onClick={copyDownloadUrlToClipboard}>C</button>
        <button disabled={numSelected <= 0} onClick={copyDownloadKeyToClipboard}>K</button>
      </div>
    </div>
  )
}

Browser.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRename: PropTypes.func,
  onDelete: PropTypes.func
}
