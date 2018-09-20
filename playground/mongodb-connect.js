//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/Todoapp',
    (err, db) => {
        if (err) {
            console.log('unable to connect to MongoDb server');
            return;
        };
        console.log('Connected to MongoDb servier.');

        db.collection('Todos').insertOne({
            text: 'Something to do',
            completed: false
        },
        (err, result) => {
            if (err) {
                return console.log('Unable to insert todo.', err);
            }
            
            console.log(JSON.stringify(result.ops, undefined, 2));
        });
        db.close();
    });
