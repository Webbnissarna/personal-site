const express = require('express');
const path = require('path');
const fsp = require('fs').promises;

const router = express.Router();
router.use('/', express.static(path.join(__dirname, 'static')));

exports.subdomainName = 'test';
exports.router = router;

// API definition
exports.api = {
  dbName: 'test',
  getGQLSchemaContents: async () => { return await fsp.readFile(path.join(__dirname, 'schema.graphql'), {encoding: 'utf8'}); },
  getDBQueryRoot: async (db) => {
    const con = await db.getConnection('test');
    await Promise.all([
      db.registerSchemaAndGetModel(con, 'Person', {
        name: String,
        birthdate: Date,
        bald: Boolean,
        net_worth: Number,
        tags: [String]
      }),
      db.registerSchemaAndGetModel(con, 'Website', {
        name: String,
        desc: String,
        score: Number
      })
    ]);
    return {
      people: () => {
        return con.model('Person').find({});
      },
      websites: () => {
        return con.model('Website').find({});
      }
    };
  }
};