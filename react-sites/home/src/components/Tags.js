import React from 'react'
import PropTypes from 'prop-types'
import SharedStyles from '../Shared.module.scss'

export default function Tags ({ tags, keyPrefix }) {
  return (
    <div className={SharedStyles.tagRoot}>
      { tags.map((tag, tagIndex) => (
        <span key={`${keyPrefix}_tag_${tagIndex}`} className={SharedStyles.tag}>{tag}</span>
      ))}
    </div>
  )
}

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  keyPrefix: PropTypes.string
}
