import React from 'react'
import PropTypes from 'prop-types'
import Header from '../components/Header'
import LinkList from '../components/LinkList'

export default function Home () {
  const mainLinks = [
    { name: 'Games', link: '/games' },
    { name: 'Projects', link: '/projects' },
    { name: 'Notes', link: '/notes' },
    { name: 'CV', link: '/cv' },
    { name: 'About Me', link: '/about' }
  ]

  return (
    <div>
      <Header />
      <LinkList links={mainLinks} />
    </div>
  )
}

Home.propTypes = {

}
