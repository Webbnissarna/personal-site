import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import SharedStyles from '../Shared.module.scss'
import ReactMarkdown from 'react-markdown'
import Util from '../Util.js'
import Tags from '../components/Tags'

export default function Game () {
  const { id } = useParams()
  const { data, loading, error } = useQuery(gql`
    query getGame {
      game(_id: "${id}") {
        title
        release_date
        tags
        body
      }
    }
  `)

  return (
    <div className={SharedStyles.pageRoot}>
      <div className={SharedStyles.rootCard}>
        <div>
          <NavLink to={'/games'}>⮜ Games</NavLink>
        </div>
        {
          (!!error || !data) && !loading ? (
            error
              ? (<span>{error.message}</span>)
              : (<span>Unknown error fetching data</span>)
          ) : (
            loading ? (<span>Loading...</span>)
              : (<>
                <div className={SharedStyles.header}>
                  <img className={SharedStyles.headerImage} alt="" src={'http://api.masterkenth-test.com/_files/main/games/sky_climb_thumb.png'} />
                  <h1>{data.game.title}</h1>
                  <span className={SharedStyles.subtitle}>{Util.formatDateNumber(data.game.release_date)}</span>
                  <Tags tags={data.game.tags} />
                </div>
                <div>
                  <ReactMarkdown source={data.game.body} />
                </div>
              </>)
          )
        }
      </div>
    </div>
  )

  // <div>
  //  { !!error && <span>Error: {`${error}`}</span> }
  //  { loading ? (<span>Loading...</span>) : (
  //    <div>
  //      <b>Title: </b><span>{data.game.title}</span><br />
  //      <b>Release Date: </b><span>{new Date(Number.parseInt(data.game.release_date)).toISOString()}</span><br />
  //      <b>Body: </b><span>{data.game.body}</span>
  //    </div>
  //  )
  //  }
  // </div>
}

Game.propTypes = {
}
