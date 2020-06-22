import React from 'react'
import { useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

export default function Game () {
  const { id } = useParams()
  const { data, loading, error } = useQuery(gql`
    query getGame {
      game(_id: "${id}") {
        title
        release_date
        body
      }
    }
  `)

  return <div>
    { !!error && <span>Error: {`${error}`}</span> }
    { loading ? (<span>Loading...</span>) : (
      <div>
        <b>Title: </b><span>{data.game.title}</span><br />
        <b>Release Date: </b><span>{new Date(Number.parseInt(data.game.release_date)).toISOString()}</span><br />
        <b>Body: </b><span>{data.game.body}</span>
      </div>
    )
    }
  </div>
}

Game.propTypes = {
}
