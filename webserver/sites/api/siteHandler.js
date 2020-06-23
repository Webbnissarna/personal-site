const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');
const cors = require('cors');
const db = require('../../db');

const router = express.Router();
router.use(cors());

// Serve static files stored in Mongo GridFS
router.get('/_files/:id*', async (req, res) => {
  const id = req.params['id'] + req.params[0];
  
  const fileMetaList = await db.getFileModel().find({ filename: id });
  if(fileMetaList.length > 0) {
    const fileMeta = fileMetaList[0];
    const readStream = db.getFileModel().read({_id: fileMeta._id});
    res.header('Cache-Control', 'public, max-age=31536000'); // Set default cache to 1 year
    res.header('Content-Length', fileMeta.length);
    if(fileMeta.contentType) {
      res.header('Content-Type', fileMeta.contentType);
    }
    readStream.on('error', (err) => {
      res.status(500).end();
      console.log(`files error for ${id}: ${err}`);
    });
    readStream.pipe(res);
  } else {
    res.status(404).send('file not found fam');
  }
});

function registerGraphQLHandler(dbName, gqlSchemaContents, dbQueryRoot) {
  const apiEndpoint = `/${dbName}/graphql`;
  router.use(apiEndpoint, graphqlHTTP({
    schema: graphql.buildSchema(gqlSchemaContents),
    graphiql: false,
    rootValue: dbQueryRoot
  }));
  console.log(`(api) registered gql ${apiEndpoint}`);
}

function registerFallbackHandler() {
  router.use('/', (req, res) => {
    const hostWithoutSubdomains = req.hostname.split('.').slice(req.subdomains.length).join('.');
    const newUrl = `${req.protocol}://${hostWithoutSubdomains}`;
    res.redirect(newUrl);
  });
  console.log('(api) registered fallback handler');
}

exports.subdomainName = 'api';
exports.router = router;
exports.registerGraphQLHandler = registerGraphQLHandler;
exports.registerFallbackHandler = registerFallbackHandler;