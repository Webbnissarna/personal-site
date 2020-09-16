/** @jsx jsx */
import React, { useState, useRef } from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './AddNoteForm.module.scss'
import path from 'path'

export default function AddNoteForm ({ onUpload }) {
  const [noteData, setNoteData] = useState({
    id: '',
    desc: '',
    imageKey: '',
    hidden: false,
    _meta: {
      tagsStr: '',
      path: null,
      update: false
    }
  })
  const fileInputRef = useRef()

  const handleFileInput = (e) => {
    const files = [...fileInputRef.current.files]
    if (files.length > 0) {
      const file = files[0]
      setNoteData(p => ({ ...p, id: file.name.slice(0, -3), _meta: { ...p._meta, path: file.path } }))
    } else {
      setNoteData(p => ({ ...p, _meta: { ...p._meta, path: null } }))
    }
  }

  const handleIDInput = (e) => {
    const v = e.currentTarget.value
    setNoteData(p => ({ ...p, id: v }))
  }

  const handleDescInput = (e) => {
    const v = e.currentTarget.value
    setNoteData(p => ({ ...p, desc: v }))
  }

  const handleTagsInput = (e) => {
    const v = e.currentTarget.value
    setNoteData(p => ({ ...p, tagsStr: v }))
  }

  const handleImageKeyInput = (e) => {
    const v = e.currentTarget.value
    setNoteData(p => ({ ...p, imageKey: v }))
  }

  const handleHiddenInput = (e) => {
    const v = e.currentTarget.checked
    setNoteData(p => ({ ...p, hidden: v }))
  }

  const handleUpdateInput = (e) => {
    const v = e.currentTarget.checked
    setNoteData(p => ({ ...p, _meta: { ...p._meta, update: v } }))
  }

  const doUpload = () => onUpload({
    ...noteData,
    tags: noteData._meta.tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t)
  })

  return (
    <div className={Styles.formRoot}>
      <div
        className={Styles.form}
        sx={{ gap: 1 }}
      >
        <input type='file' accept='.md' ref={fileInputRef} onChange={handleFileInput} />
        <input type='text' placeholder='id' value={noteData.id} onChange={handleIDInput} />
        <textarea placeholder='Description' value={noteData.desc} onChange={handleDescInput} />
        <input type='text' placeholder='Comma-separated tags' value={noteData.tagsStr} onChange={handleTagsInput} />
        <input type='text' placeholder='Image key' value={noteData.imageKey} onChange={handleImageKeyInput} />
        <div sx={{ gap: 1 }}>
          <input type='checkbox' id='hidden' checked={noteData.hidden} onChange={handleHiddenInput} />
          <label htmlFor='hidden'>Hidden</label>
          <input type='checkbox' id='update' checked={noteData._meta.update} onChange={handleUpdateInput} />
          <label htmlFor='update'>Update</label>
        </div>
        <button disabled={!noteData._meta.path || !noteData.id} onClick={doUpload}>Add</button>
      </div>
    </div>
  )
}

AddNoteForm.propTypes = {
  onUpload: PropTypes.func
}
