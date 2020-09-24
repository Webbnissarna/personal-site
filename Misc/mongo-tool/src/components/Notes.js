/** @jsx jsx */
import React, { useRef, useState } from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './Notes.module.scss'
import NoteListEntry from './NoteListEntry'

const electron = window.require('electron')

export default function Notes ({ notes, onDownload }) {
  const [selectedId, setSelectedId] = useState(-1)
  const downloadAnchor = useRef()

  const doDownload = () => {
    const note = notes.find(n => n.id === selectedId)
    onDownload(note)
  }

  return (
    <div
      className={Styles.notesRoot}
      sx={{ p: 1, gap: 1 }}
    >
      <div
        className={Styles.list}
        sx={{ gap: 1 }}
        onClick={() => setSelectedId(-1)}
      >
        { notes.map(n => (
          <NoteListEntry onClick={(e) => { setSelectedId(n.id); e.stopPropagation() }} selected={selectedId === n.id} key={n.id} id={n.id} title={n.title} hidden={n.hidden} />
        ))}
      </div>
      <div
        className={Styles.actionArea}
        sx={{ gap: 1 }}
      >
        <button disabled={selectedId < 0} onClick={doDownload}>Download</button>
        <a ref={downloadAnchor} hidden={true} />
      </div>
    </div>
  )
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDownload: PropTypes.func
}
