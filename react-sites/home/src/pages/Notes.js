import React from 'react'
import { NavLink } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import ReactMarkdown from 'react-markdown'
import Styles from './Notes.module.scss'
import SharedStyles from '../Shared.module.scss'
import Util from '../Util.js'
import Tags from '../components/Tags'

export default function Notes () {
  const { data, loading, error } = useQuery(gql`
    query getNotes {
      notes {
        _id
        title
        hidden
        imageKey
        desc
        uploadDate
        tags
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
          <h1>Notes</h1>
          <span>A collection of notes of various topics</span>
        </div>
        <div className={SharedStyles.listContainer}>
          {
            (!!error || !data) && !loading ? (
              error
                ? (<span>{error.message}</span>)
                : (<span>Unknown error fetching data</span>)
            ) : (
              loading ? (<span>Loading...</span>)
                : (data.notes.filter(n => !n.hidden).map((note, index) => (
                  <NavLink key={`note_${index}`} to={`/notes/${note._id}`}>
                    <div className={SharedStyles.listCard}>
                      { note.imageKey && <div className={SharedStyles.img} style={{ backgroundImage: `url(${Util.getStaticContentUrl(note.imageKey)})` }} /> }
                      <div className={SharedStyles.content}>
                        <div className={SharedStyles.metaRoot}>
                          <Tags tags={note.tags} keyPrefix={`note_${index}`} />
                          <div className={SharedStyles.spacer} />
                          <span>{Util.formatDateNumber(note.uploadDate)}</span>
                        </div>
                        <div className={SharedStyles.innerContent}>
                          <h2>{note.title}</h2>
                          <div>
                            <ReactMarkdown source={note.desc} disallowedTypes={['paragraph']} unwrapDisallowed />
                          </div>
                        </div>
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

  // <div>
  //  <h1>Notes</h1>
  //  {
  //    (!!error || !data) && !loading ? (
  //      error
  //        ? (<span>{error.message}</span>)
  //        : (<span>Unknown error fetching data</span>)
  //    ) : (
  //      loading ? (<span>Loading...</span>)
  //        : (data.notes.map((note, index) => (
  //          <div key={`note_${index}`}>
  //            <NavLink to={`/notes/${note._id}`}>{note.title}</NavLink> -
  //            <ReactMarkdown source={note.desc} disallowedTypes={['paragraph']} unwrapDisallowed />
  //          </div>
  //        )))
  //    )
  //  }
  // </div>
}

Notes.propTypes = {

}
