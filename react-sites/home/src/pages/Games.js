import React from 'react'
import { NavLink } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

export default function Games () {
  const { data, loading, error } = useQuery(gql`
    query getGames {
      games {
        _id
        highlight
        title
        desc
        release_date
      }
    }
  `)

  return <div>
    <h1>Games</h1>
    { !!error && <span>Error: {`${error}`}</span> }
    { loading ? (<span>Loading...</span>) : (
      data.games.map((game, index) => (
        <div key={`game_${index}`}>
          <NavLink to={`/games/${game._id}`}>{game.title}</NavLink> - <span>{game.desc}</span>
        </div>
      ))
    ) }
  </div>
}

Games.propTypes = {

}
