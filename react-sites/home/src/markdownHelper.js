/* eslint-disable react/display-name */
import React from 'react'
import JsxParser from 'react-jsx-parser'
import Grid from './components/Grid'
import LinkBox from './components/LinkBox'

export default {
  renderers: {
    // eslint-disable-next-line react/prop-types
    code: ({ language, value }) => {
      if (language === 'react') {
        return <JsxParser jsx={value} components={{ Grid, LinkBox }} />
      }
      const className = language && `language-${language}`
      const code = React.createElement('code', className ? { className: className } : null, value)
      return React.createElement('pre', {}, code)
    }
  }
}
