/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './Notes.module.scss'

export default function Notes ({ notes }) {
  return (
    <div></div>
  )
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.object).isRequired
}
