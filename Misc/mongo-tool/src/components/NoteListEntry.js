/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Styles from './NoteListEntry.module.scss'

import imgHidden from '../images/visibility.svg'

export default function NoteListEntry ({ id, title, hidden, selected, onClick }) {
  return (
    <div onClick={onClick} className={classnames(Styles.note, selected && Styles.selected)}>
      <img src={imgHidden} alt="" className={hidden && Styles.visible} />
      <span>{id}</span>
      <span>{title}</span>
    </div>
  )
}

NoteListEntry.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  hidden: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func
}
