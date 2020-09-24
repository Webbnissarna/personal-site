import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Styles from './ScreenshotViewer.module.scss'
import classnames from 'classnames'
import Util from '../Util.js'

export default function ScreenshotViewer ({ screenshotUrls, thumbnailUrls }) {
  const [viewerVisible, setViewerVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleClickThumbnail = (index) => {
    setActiveIndex(index)
    setViewerVisible(true)
  }

  const handleNextIndex = () => {
    setActiveIndex((p) => (p + 1) % screenshotUrls.length)
  }

  const handlePrevIndex = () => {
    setActiveIndex((p) => (p <= 0 ? screenshotUrls.length - 1 : p - 1))
  }

  const handleCloseViewer = () => {
    setViewerVisible(false)
  }

  return (
    <div>
      <div className={Styles.screenshotsArea}>
        { thumbnailUrls.map((ssId, i) => (
          <div key={ssId} onClick={() => handleClickThumbnail(i)} className={Styles.screenshotThumb}>
            <img src={Util.getStaticContentUrl(ssId)} />
          </div>
        )) }
      </div>
      { viewerVisible && <div className={Styles.fullViewer}>
        <img src={Util.getStaticContentUrl(screenshotUrls[activeIndex])} />
        <div className={Styles.overlay}>
          <button onClick={handleCloseViewer} className={Styles.closeButton}>X</button>
          <button onClick={handlePrevIndex} className={Styles.prevButton}>&lt;</button>
          <button onClick={handleNextIndex} className={Styles.nextButton}>&gt;</button>
          <div className={Styles.fullLink}>
            <a href={Util.getStaticContentUrl(screenshotUrls[activeIndex])} target="_blank" rel="noreferrer">View Full Image</a>
          </div>
          <div className={Styles.indicators}>
            { screenshotUrls.map((ssId, i) => (
              <div key={ssId} className={classnames(Styles.indicator, i === activeIndex && Styles.active)}></div>
            )) }
          </div>
        </div>
      </div>}
    </div>
  )
}

ScreenshotViewer.propTypes = {
  screenshotUrls: PropTypes.arrayOf(PropTypes.string),
  thumbnailUrls: PropTypes.arrayOf(PropTypes.string)
}
