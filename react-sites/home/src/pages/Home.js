import React from 'react'
import PropTypes from 'prop-types'
import Header from '../components/Header'
import LinkList from '../components/LinkList'
import Styles from './Home.module.scss'

export default function Home () {
  const mainLinks = [
    { name: 'Games', link: '/games' },
    { name: 'Projects', link: '/projects' },
    { name: 'Notes', link: '/notes' },
    { name: 'CV', link: '/cv' },
    { name: 'About Me', link: '/about' }
  ]

  return (
    <div className={Styles.root}>
      <Header />
      <div className={Styles.menu}>
        <LinkList links={mainLinks} />
      </div>
    </div>
  )
}

Home.propTypes = {

}
