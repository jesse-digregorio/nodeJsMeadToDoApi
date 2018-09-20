//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/Todoapp',
    (err, db) => {
        if (err) {
            console.log('unable to connect to MongoDb server');
            return;
        };
        console.log('Connected to MongoDb servier.');

        db.collection('Todos').find().toArray().then((docs) => {
            console.log('todos');
            console.log(docs);
        }, (err) => {
            console.log('Unable to fetch todos.', err);
        });
        

        // db.close();
    });
