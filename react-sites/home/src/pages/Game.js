import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import SharedStyles from '../Shared.module.scss'
import Util from '../Util.js'
import Tags from '../components/Tags'
import path from 'path'
import ScreenshotViewer from '../components/ScreenshotViewer'
import MarkdownRoot from '../components/MarkdownRoot'

export default function Game () {
  const { id } = useParams()
  const { data, loading, error } = useQuery(gql`
    query getGame {
      game(_id: "${id}") {
        title
        release_date
        tags
        body
        presentation {
          thumb
          backdrop
          screenshots
        }
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
                  <img className={SharedStyles.headerImage} alt="" src={Util.getStaticContentUrl(data.game.presentation.thumb)} />
                  <h1>{data.game.title}</h1>
                  <span className={SharedStyles.subtitle}>{Util.formatDateNumber(data.game.release_date)}</span>
                  <Tags tags={data.game.tags} />
                </div>
                <MarkdownRoot source={data.game.body} />
                <ScreenshotViewer
                  screenshotUrls={data.game.presentation.screenshots}
                  thumbnailUrls={data.game.presentation.screenshots.map((ssId) => `${ssId.substr(0, ssId.lastIndexOf('.'))}-thumb${path.extname(ssId)}`)}
                />
              </>)
          )
        }
      </div>
    </div>
  )
}

Game.propTypes = {
}
