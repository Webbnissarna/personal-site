const express = require('express');
const path = require('path');
const fsp = require('fs').promises;

const router = express.Router();
router.use('/', express.static(path.join(__dirname, 'static')));
router.get('*', (req,res) => {
  // Fallback to serve index when no exact match is found (this is required for React Router to function)
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

exports.subdomainName = null;
exports.router = router;

// API definition
exports.api = {
  dbName: 'main',
  getGQLSchemaContents: async () => { return await fsp.readFile(path.join(__dirname, 'schema.graphql'), {encoding: 'utf8'}); },
  getDBQueryRoot: async (db) => {
    const con = await db.getConnection('main');
    await Promise.all([
      db.registerSchemaAndGetModel(con, 'Game', {
        _id: String,
        highlight: Boolean,
        title: String,
        desc: String,
        release_date: Date,
        tags: [String],
        body: String
      }),
      db.registerSchemaAndGetModel(con, 'Project', {
        _id: String,
        title: String,
        desc: String,
        subdomain: String
      }),
      db.registerSchemaAndGetModel(con, 'Note', {
        _id: String,
        title: String,
        desc: String,
        post_date: Date,
        body: String
      })
    ]);
    return {
      games: () => con.model('Game').find({}),
      game: (id) => con.model('Game').findById(id),
      projects: () => con.model('Project').find({}),
      project: (id) => con.model('Project').findById(id),
      notes: () => con.model('Note').find({}),
      note: (id) => con.model('Note').findById(id)
    };
  }
};