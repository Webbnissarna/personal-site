/** @jsx jsx */
import React, { useState, useRef } from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './UploadForm.module.scss'

function bytesToString (bytes) {
  if (bytes < 1000) { return `${bytes} b` } else if (bytes < 1000 * 1000) { return `${bytes / 1000} Kb` } else { return `${bytes / 1000 / 1000} Mb` }
}

export default function UploadForm ({ onUpload, disabled }) {
  const [formValues, setFormValues] = useState({ key: '', contentType: '', filePath: '' })
  const [previewUri, setPreviewUri] = useState(null)
  const [meta, setMeta] = useState({ size: -1 })
  const fileInputRef = useRef()

  const handleFileInput = (e) => {
    const files = fileInputRef.current.files
    if (files.length > 0) {
      const file = files[0]
      setFormValues(p => ({ ...p, contentType: file.type, filePath: file.path }))
      setMeta(p => ({ ...p, size: file.size }))

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          setPreviewUri(reader.result)
        })
        reader.readAsDataURL(file)
      } else {
        setPreviewUri(null)
      }
    } else {
      setFormValues(p => ({ ...p, filePath: null }))
      setMeta(p => ({ ...p, size: -1 }))
      setPreviewUri(null)
    }
  }

  const handleKeyInput = (e) => {
    const v = e.currentTarget.value
    setFormValues(p => ({ ...p, key: v }))
  }

  const handleTypeInput = (e) => {
    const v = e.currentTarget.value
    setFormValues(p => ({ ...p, contentType: v }))
  }

  const handleUpload = () => {
    onUpload(formValues)
  }

  return (
    <div className={Styles.formRoot}>
      <div
        className={Styles.form}
        sx={{ gap: 1 }}
      >
        <h1>Upload</h1>
        { previewUri && <img src={previewUri} alt='preview' /> }
        <input disabled={disabled} type='text' placeholder='Key' value={formValues.key} onChange={handleKeyInput} />
        <input disabled={disabled} type='text' placeholder='Content Type' value={formValues.contentType} onChange={handleTypeInput} />
        <input disabled={disabled} type='file' ref={fileInputRef} onChange={handleFileInput} />
        <button disabled={disabled || !formValues.key || !formValues.contentType || !formValues.filePath} onClick={handleUpload}>Upload</button>
        { meta.size >= 0 && <span>{bytesToString(meta.size)}</span> }
      </div>
    </div>
  )
}

UploadForm.propTypes = {
  onUpload: PropTypes.func,
  disabled: PropTypes.bool
}
