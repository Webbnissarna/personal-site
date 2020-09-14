/** @jsx jsx */
import React, { useState, useRef } from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './UploadForm.module.scss'
import path from 'path'
import _ from 'lodash'

function bytesToString (bytes) {
  if (bytes < 1000) { return `${bytes} b` } else if (bytes < 1000 * 1000) { return `${bytes / 1000} Kb` } else { return `${bytes / 1000 / 1000} Mb` }
}

export default function UploadForm ({ onUpload }) {
  const [preppedFiles, setPreppedFiles] = useState([])
  const [previewUri, setPreviewUri] = useState(null)
  const [meta, setMeta] = useState({ dir: '', size: -1 })
  const fileInputRef = useRef()

  const handleFileInput = (e) => {
    const files = [...fileInputRef.current.files]
    if (files.length > 0) {
      const previewFile = files.find(f => f.type.startsWith('image/'))

      if (previewFile) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          setPreviewUri(reader.result)
        })
        reader.readAsDataURL(previewFile)
      } else {
        setPreviewUri(null)
      }

      const totalSize = files.reduce((prev, curr) => prev + curr.size, 0)
      setMeta(p => ({ ...p, size: totalSize }))
      setPreppedFiles(p => files.map(f => ({
        key: f.name,
        filePath: f.path,
        contentType: f.type
      })))
    } else {
      setPreppedFiles([])
      setMeta(p => ({ ...p, size: -1 }))
      setPreviewUri(null)
    }
  }

  const handleDirInput = (e) => {
    const v = e.currentTarget.value
    setMeta(p => ({ ...p, dir: v }))
  }

  const handleKeyInput = (e) => {
    const v = e.currentTarget.value
    setPreppedFiles(p => {
      const n = _.cloneDeep(p)
      n[0].key = v
      return n
    })
  }

  const handleTypeInput = (e) => {
    const v = e.currentTarget.value
    setPreppedFiles(p => {
      const n = _.cloneDeep(p)
      n[0].contentType = v
      return n
    })
  }

  const handleUpload = () => {
    onUpload(preppedFiles.map(f => ({ ...f, key: path.join(meta.dir, f.key) })))
  }

  return (
    <div className={Styles.formRoot}>
      <div
        className={Styles.form}
        sx={{ gap: 1 }}
      >
        <h1>Upload</h1>
        { previewUri && <img src={previewUri} alt='preview' /> }
        <input
          disabled={preppedFiles.length < 2}
          type='text'
          placeholder='Dir'
          value={meta.dir}
          onChange={handleDirInput} />
        <input
          disabled={preppedFiles.length !== 1}
          type='text'
          placeholder='Key'
          value={preppedFiles.length > 0 ? preppedFiles[0].key : ''}
          onChange={handleKeyInput} />
        <input
          disabled={preppedFiles.length !== 1}
          type='text'
          placeholder='Content Type'
          value={preppedFiles.length > 0 ? preppedFiles[0].contentType : ''}
          onChange={handleTypeInput} />
        <input
          type='file'
          multiple={true}
          ref={fileInputRef}
          onChange={handleFileInput} />
        <button disabled={preppedFiles.length === 0} onClick={handleUpload}>Upload</button>
        { meta.size >= 0 && <span>{bytesToString(meta.size)}</span> }
      </div>
    </div>
  )
}

UploadForm.propTypes = {
  onUpload: PropTypes.func
}
