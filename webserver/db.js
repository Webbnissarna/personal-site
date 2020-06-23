const mongo = require('mongoose');
const { createModel } = require('mongoose-gridfs');

let connectionPool = [];
let fileModel = null;

async function getConnection(dbName) {
  let con = connectionPool[dbName];
  if(con === undefined) {
    con = await mongo.createConnection(`mongodb://root:password@masterkenth-test.com:27017/${dbName}?authSource=admin`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    con.on('error', (err) => { console.error(`mongo error connecting to '${dbName}' (${err})`); });
    con.once('open', () => { console.error(`mongo opened connecting to ${dbName}`); });
    connectionPool[dbName] = con;
  }
  return con;
}

function registerSchemaAndGetModel(dbCon, modelName, schemaObj) {
  const schema = new mongo.Schema(schemaObj);
  const model = dbCon.model(modelName, schema);
  console.log(`mongo registered model ${dbCon.name}::${modelName}`);
  return model;
}

async function registerFileModel() {
  const con = await getConnection('files');
  fileModel = createModel({
    modelName: 'File',
    connection: con
  });
  console.log('mongo registered file handler');
}

function getFileModel() {
  return fileModel;
}

exports.getConnection = getConnection;
exports.registerSchemaAndGetModel = registerSchemaAndGetModel;
exports.registerFileModel = registerFileModel;
exports.getFileModel = getFileModel;