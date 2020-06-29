import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import ReactMarkdown from 'react-markdown'
import Styles from './Note.module.scss'
import SharedStyles from '../Shared.module.scss'
import Util from '../Util.js'

export default function Note () {
  const { id } = useParams()
  const { data, loading, error } = useQuery(gql`
    query getNote {
      note(_id: "${id}") {
        title
        img_key
        post_date
        body
      }
    }
  `)

  return (
    <div className={SharedStyles.pageRoot}>
      <div className={SharedStyles.rootCard}>
        <div>
          <NavLink to={'/notes'}>⮜ Notes</NavLink>
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
                  { data.note.img_key && <img className={Styles.headerImage} alt="" src={Util.getStaticContentUrl(data.note.img_key)} /> }
                  <h1>{data.note.title}</h1>
                  <span className={Styles.subtitle}>{Util.formatDateNumber(data.note.post_date)}</span>
                </div>
                <div>
                  <ReactMarkdown source={data.note.body} />
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
  //      <b>Title: </b><span>{data.note.title}</span><br />
  //      <b>Post Date: </b><span>{new Date(Number.parseInt(data.note.post_date)).toISOString()}</span><br />
  //      <b>Body: </b><br />
  //      <ReactMarkdown source={data.note.body} />
  //    </div>
  //  )
  //  }
  // </div>
}

Note.propTypes = {
}
