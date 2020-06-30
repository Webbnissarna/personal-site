import React from 'react'
import { NavLink } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Styles from './Projects.module.scss'
import SharedStyles from '../Shared.module.scss'

export default function Projects () {
  const { data, loading, error } = useQuery(gql`
    query getProjects {
      projects {
        title
        desc
        subdomain
      }
    }
  `)

  return (
    <div className={SharedStyles.pageRoot}>
      <div className={SharedStyles.rootCard}>
        <div>
          <NavLink to={'/'}>⮜ Home</NavLink>
        </div>
        <div className={SharedStyles.header}>
          <h1>Projects</h1>
          <span>A list of various non-game projects (websites, apps etc.) I&apos;ve made or I&apos;m currently working on</span>
        </div>
        <div className={SharedStyles.listContainer}>
          {
            (!!error || !data) && !loading ? (
              error
                ? (<span>{error.message}</span>)
                : (<span>Unknown error fetching data</span>)
            ) : (
              loading ? (<span>Loading...</span>)
                : (data.projects.map((project, index) => (
                  <a key={`project_${index}`} href={`https://${project.subdomain}.${window.location.hostname}/`}>
                    <div className={SharedStyles.listCard}>
                      <img src={'http://api.masterkenth-test.com/_files/main/games/sky_climb_thumb.png'} />
                      <div className={SharedStyles.content}>
                        <div className={SharedStyles.innerContent}>
                          <h2>{project.title}</h2>
                          <p>{project.desc}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                )))
            )
          }
        </div>
      </div>
    </div>
  )
}

Projects.propTypes = {

}
