/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import PropTypes from 'prop-types'
import path from 'path'
import classnames from 'classnames'
import Styles from './BrowserFile.module.scss'

import imgFolder from '../images/folder.svg'
import imgDocument from '../images/document.svg'
import imgPicture from '../images/picture.svg'
import imgText from '../images/text-format.svg'

const imgMap = {
  folder: imgFolder,
  png: imgPicture,
  bmp: imgPicture,
  jpg: imgPicture,
  jpeg: imgPicture,
  txt: imgText,
  md: imgText,
  _: imgDocument
}

export default function BrowserFile ({ type, filePath, viewType, checked, additionalColumns, onClick }) {
  const fileImg = type === 'dir' ? imgMap.folder : (imgMap[path.extname(filePath).slice(1)] || imgMap._)

  return (
    <div
      className={classnames(Styles.cell, Styles[viewType])}
      sx={{ p: 1, gap: 1 }}
      onClick={onClick}
    >
      <div className={classnames(Styles.check, checked && Styles.checked, type === 'dir' && Styles.hidden)} />
      <img src={fileImg} alt="" />
      <span>{path.basename(filePath)}</span>
      { viewType === 'list' && additionalColumns && additionalColumns.map((c, i) => (
        <span
          key={i}
          sx={{ fontSize: 1 }}
        >{c}</span>
      ))}
    </div>
  )
}

BrowserFile.propTypes = {
  type: PropTypes.oneOf(['file', 'dir']).isRequired,
  filePath: PropTypes.string.isRequired,
  viewType: PropTypes.oneOf(['grid', 'list']).isRequired,
  checked: PropTypes.bool,
  additionalColumns: PropTypes.array,
  onClick: PropTypes.func
}
