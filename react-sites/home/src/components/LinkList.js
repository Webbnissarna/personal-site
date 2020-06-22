import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default function LinkList ({ links }) {
  return <ul>
    {links.map((item, index) => (
      <li key={`link_${index}`}><Link to={item.link}>{item.name}</Link></li>
    ))}
  </ul>
}

LinkList.propTypes = {
  links: PropTypes.array
}
