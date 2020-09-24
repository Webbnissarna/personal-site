import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import Styles from './MarkdownRoot.module.scss'
import mdh from '../markdownHelper'
import Util from '../Util.js'

export default function MarkdownRoot ({ source }) {
  return (
    <div className={Styles.markdownRoot}>
      <ReactMarkdown
        escapeHtml={false}
        source={Util.replaceMDLinks(source)}
        renderers={mdh.renderers}
      />
    </div>
  )
}

MarkdownRoot.propTypes = {
  source: PropTypes.string.isRequired
}
