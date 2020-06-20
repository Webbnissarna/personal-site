import React from 'react';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from 'graphql-tag';
import { ApolloProvider } from "@apollo/react-hooks";
import { useQuery } from "@apollo/react-hooks";
import './App.css';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "https://api.masterkenth-test.com/test/graphql"
});

const client = new ApolloClient({
  cache,
  link
});


function People(props) {
  const { data, loading, error } = useQuery(gql`
    query getPeople {
      people {
        name
        birthdate
        bald
        net_worth
      }
    }
  `);

  const dateStringFromMillisString = (millis) => {
    const date = new Date(Number.parseInt(millis));
    return `${date.getFullYear()}-${`${date.getMonth()+1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
  };

  return (
    <div>
      { !!error && <span>Error: {`${error}`}</span> }
      { loading ? (<span>Loading...</span>) : (
        data.people.map((person, index) => (
          <div key={`person_${index}`} style={{margin: 20}}>
            <b>Name: </b><span>{person.name}</span><br />
            <b>Birthdate: </b><span>{dateStringFromMillisString(person.birthdate)}</span><br />
            <b>Bald?: </b><span>{person.bald ? 'yes' : 'no'}</span><br />
            <b>Net Worth: </b><span>{person.net_worth}b</span>
          </div>
        ))
      ) }
    </div>
  );
}

function Websites(props) {
  const { data, loading, error } = useQuery(gql`
    query getPeople {
      websites {
        name
        desc
        score
      }
    }  
  `);

  return (
    <div>
      { !!error && <span>Error: {`${error}`}</span> }
      { loading ? (<span>Loading...</span>) : (
        data.websites.map((website, index) => (
          <div key={`website_${index}`} style={{margin: 20}}>
            <b>Name: </b><span>{website.name}</span><br />
            <b>Description: </b><span>{website.desc}</span><br />
            <b>Score: </b>{[...Array(website.score)].map((e,i) => (<span key={`${website.name}_star${i}`} role='img' aria-label='star'>⭐</span>))}<br />
          </div>
        ))
      ) }
    </div>
  );
}

function App() {

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Test Site</h1>
        <h2>People</h2>
          <People />
        <h2>Websites</h2>
          <Websites />
      </div>
    </ApolloProvider>
  );
}

export default App;
