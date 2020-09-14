/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './Notes.module.scss'
import NoteListEntry from './NoteListEntry'

export default function Notes ({ notes }) {
  return (
    <div
      className={Styles.list}
      sx={{ gap: 1 }}
    >
      { notes.map(n => (
        <NoteListEntry key={n.id} id={n.id} title={n.title} hidden={n.hidden} />
      ))}
    </div>
  )
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.object).isRequired
}
