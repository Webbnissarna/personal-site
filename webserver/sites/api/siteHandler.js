const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const cors = require('cors');

const router = express.Router();
router.use(cors());

function registerGraphQLHandler(dbName, gqlSchemaContents, dbQueryRoot) {
  const apiEndpoint = `/${dbName}/graphql`;
  router.use(apiEndpoint, graphqlHTTP({
    schema: graphql.buildSchema(gqlSchemaContents),
    graphiql: false,
    rootValue: dbQueryRoot
  }));
  console.log(`(api) registered gql ${apiEndpoint}`);
}

exports.subdomainName = 'api';
exports.router = router;
exports.registerGraphQLHandler = registerGraphQLHandler;