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
        imageKey
        subdomain
        url
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
          <span>A list of various non-game projects (websites, apps etc.) I&apos;ve made or I&apos;m working on</span>
        </div>
        <div className={SharedStyles.listContainer}>
          {
            (!!error || !data) && !loading ? (
              error
                ? (<span>{error.message}</span>)
                : (<span>Unknown error fetching data</span>)
            ) : (
              loading ? (<span>Loading...</span>)
                : data.projects.length === 0 ? (
                  <p className={SharedStyles.centeredFallback}>No projects currently published, please check back later 🙂</p>
                ) : (
                  data.projects.map((project, index) => (
                    <a key={`project_${index}`} href={project.url || `https://${project.subdomain}.${window.location.hostname}/`}>
                      <div className={SharedStyles.listCard}>
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
