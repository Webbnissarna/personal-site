import React from 'react'
import { NavLink } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Styles from './Games.module.scss'
import SharedStyles from '../Shared.module.scss'
import Tags from '../components/Tags'
import Util from '../Util'

export default function Games () {
  const { data, loading, error } = useQuery(gql`
    query getGames {
      games {
        _id
        highlight
        title
        desc
        tags
        release_date
        presentation {
          thumb
        }
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
          <h1>Games</h1>
          <span>A list of game projects I&apos;m working on or have worked on in the past</span>
        </div>
        <div className={Styles.listContainer}>
          {
            (!!error || !data) && !loading ? (
              error
                ? (<span>{error.message}</span>)
                : (<span>Unknown error fetching data</span>)
            ) : (
              loading ? (<span>Loading...</span>)
                : (data.games.map((game, index) => (
                  <NavLink key={`game_${index}`} to={`/games/${game._id}`}>
                    <div className={Styles.listCard} style={{ backgroundImage: `url(${Util.getStaticContentUrl(game.presentation.thumb)})` }}>
                      <div className={Styles.content}>
                        <h2>{game.title}</h2>
                        <Tags tags={game.tags} keyPrefix={`game_${index}`} />
                        <p>{game.desc}</p>
                      </div>
                    </div>
                  </NavLink>
                )))
            )
          }
        </div>
      </div>
    </div>
  )
}

Games.propTypes = {

}
