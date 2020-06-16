const mongo = require('mongoose');

let connectionPool = [];

async function getConnection(dbName) {
  let con = connectionPool[dbName];
  if(con === undefined) {
    con = await mongo.createConnection(`mongodb://root:password@localhost:27017/${dbName}?authSource=admin`, {
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

exports.getConnection = getConnection;
exports.registerSchemaAndGetModel = registerSchemaAndGetModel;