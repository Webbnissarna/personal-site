/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import Styles from './LoadingOverlay.module.scss'
import { ReactComponent as LoaderImage } from '../loader.svg'

export default function LoadingOverlay ({ visible, text }) {
  return visible && (
    <div
      className={Styles.overlayRoot}
      sx={{ zIndex: 1, backgroundColor: 'overlay' }}
    >
      <div>
        <LoaderImage />
      </div>
      <span>{text}</span>
    </div>
  )
}

LoadingOverlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
}
