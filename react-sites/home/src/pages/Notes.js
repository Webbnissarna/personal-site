import React from 'react'
import { NavLink } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import ReactMarkdown from 'react-markdown'

export default function Notes () {
  const { data, loading, error } = useQuery(gql`
    query getGames {
      notes {
        _id
        title
        desc
        post_date
      }
    }
  `)

  return <div>
    <h1>Notes</h1>
    {
      (!!error || !data) && !loading ? (
        error
          ? (<span>{error.message}</span>)
          : (<span>Unknown error fetching data</span>)
      ) : (
        loading ? (<span>Loading...</span>)
          : (data.notes.map((note, index) => (
            <div key={`note_${index}`}>
              <NavLink to={`/notes/${note._id}`}>{note.title}</NavLink> -
              <ReactMarkdown source={note.desc} disallowedTypes={['paragraph']} unwrapDisallowed />
            </div>
          )))
      )
    }
  </div>
}

Notes.propTypes = {

}
