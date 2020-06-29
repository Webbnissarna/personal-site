import React from 'react'
import { NavLink } from 'react-router-dom'
import SharedStyles from '../Shared.module.scss'

export default function CV () {
  return (
    <div className={SharedStyles.pageRoot}>
      <div className={SharedStyles.rootCard}>
        <div>
          <NavLink to={'/'}>⮜ Home</NavLink>
        </div>
        <div className={SharedStyles.header}>
          <h1>CV</h1>
        </div>
      </div>
    </div>
  )
}

CV.propTypes = {

}
