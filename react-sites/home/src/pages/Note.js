import React from 'react'
import { useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import ReactMarkdown from 'react-markdown'

export default function Note () {
  const { id } = useParams()
  const { data, loading, error } = useQuery(gql`
    query getNote {
      note(_id: "${id}") {
        title
        post_date
        body
      }
    }
  `)

  return <div>
    { !!error && <span>Error: {`${error}`}</span> }
    { loading ? (<span>Loading...</span>) : (
      <div>
        <b>Title: </b><span>{data.note.title}</span><br />
        <b>Post Date: </b><span>{new Date(Number.parseInt(data.note.post_date)).toISOString()}</span><br />
        <b>Body: </b><br />
        <ReactMarkdown source={data.note.body} />
      </div>
    )
    }
  </div>
}

Note.propTypes = {
}
