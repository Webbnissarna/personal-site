import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

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

  return <div>
    <h1>Games</h1>
    {
      (!!error || !data) && !loading ? (
        error
          ? (<span>{error.message}</span>)
          : (<span>Unknown error fetching data</span>)
      ) : (
        loading ? (<span>Loading...</span>)
          : (data.projects.map((project, index) => (
            <div key={`project_${index}`}>
              <a href={`https://${project.subdomain}.${window.location.hostname}/`}>{project.title}</a> - <span>{project.desc}</span>
            </div>
          )))
      )
    }
  </div>
}

Projects.propTypes = {

}
