import React from 'react'
import PropTypes from 'prop-types'

export default function Grid ({ template, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplate: template,
      gap: '5px'
    }}>
      { children }
    </div>
  )
}

Grid.propTypes = {
  template: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.object)
}
