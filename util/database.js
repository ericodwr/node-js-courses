const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

// mongodb+srv://ocire:<password>@cluster-node.iyhgh8d.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://ocire:<password>@cluster-node.iyhgh8d.mongodb.net/

let _db;

const mongoConnect = (cb) => {
  mongoClient
    .connect(
      'mongodb+srv://ocire:ocire@cluster-node.iyhgh8d.mongodb.net/shop?retryWrites=true&w=majority',
    )
    .then((client) => {
      console.log('connected');
      _db = client.db();
      cb(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw 'No database found!';
  }
};

module.exports = { mongoConnect, getDb };
