import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import ReactMarkdown from 'react-markdown/with-html'
import Styles from './Note.module.scss'
import SharedStyles from '../Shared.module.scss'
import PropTypes from 'prop-types'
import Util from '../Util'
import Tags from '../components/Tags'
import mdh from '../markdownHelper'

export default function Note ({ explicitID }) {
  const { id } = useParams()
  const idToUse = explicitID || id
  const { data, loading, error } = useQuery(gql`
    query getNote {
      note(_id: "${idToUse}") {
        title
        imageKey
        uploadDate
        tags
        body
      }
    }
  `)

  return (
    <div className={SharedStyles.pageRoot}>
      <div className={SharedStyles.rootCard}>
        <div>
          { explicitID
            ? (<NavLink to={'/'}>⮜ Home</NavLink>)
            : (<NavLink to={'/notes'}>⮜ Notes</NavLink>) }
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
                  { data.note.imageKey && <img className={SharedStyles.headerImage} alt="" src={Util.getStaticContentUrl(data.note.imageKey)} /> }
                  <h1>{data.note.title}</h1>
                  <span className={SharedStyles.subtitle}>{Util.formatDateNumber(data.note.uploadDate)}</span>
                  <Tags tags={data.note.tags} />
                </div>
                <div>
                  <ReactMarkdown
                    escapeHtml={false}
                    source={Util.replaceMDLinks(data.note.body)}
                    renderers={mdh.renderers}
                  />
                </div>
              </>)
          )
        }
      </div>
    </div>
  )
}

Note.propTypes = {
  explicitID: PropTypes.string
}
