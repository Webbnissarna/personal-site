import React from 'react'
import PropTypes from 'prop-types'
import Styles from './LinkBox.module.scss'

export default function LinkBox ({ href, text, bcolor, tcolor }) {
  return (
    <a className={Styles.link} href={href} style={{ backgroundColor: bcolor, color: tcolor }}>
      {text}
    </a>
  )
}

LinkBox.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  bcolor: PropTypes.string,
  tcolor: PropTypes.string
}
