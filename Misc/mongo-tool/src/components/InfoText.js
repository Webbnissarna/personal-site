/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'

export default function InfoText ({ type, text }) {
  return (
    <span
      sx={{
        color: type,
        fontSize: 0
      }}
    >{text}</span>
  )
}

InfoText.propTypes = {
  type: PropTypes.oneOf(['good', 'warn', 'err']).isRequired,
  text: PropTypes.string.isRequired
}
