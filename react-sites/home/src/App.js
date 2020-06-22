import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloProvider } from '@apollo/react-hooks'

import Home from './pages/Home'
import Games from './pages/Games'
import Game from './pages/Game'
import Projects from './pages/Projects'
import Notes from './pages/Notes'
import Note from './pages/Note'
import CV from './pages/CV'
import About from './pages/About'

const cache = new InMemoryCache()
const link = new HttpLink({
  uri: 'http://api.masterkenth-test.com/main/graphql'
})

const client = new ApolloClient({
  cache,
  link
})

function App () {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route exact path="/"><Home /></Route>
          <Route exact path="/games"><Games /></Route>
          <Route exact path="/games/:id"><Game /></Route>
          <Route exact path="/projects"><Projects /></Route>
          <Route exact path="/notes"><Notes /></Route>
          <Route exact path="/notes/:id"><Note /></Route>
          <Route exact path="/cv"><CV /></Route>
          <Route exact path="/about"><About /></Route>
        </Switch>
      </Router>
    </ApolloProvider>
  )
}

export default App
