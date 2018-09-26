var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var mongoose = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

//GET /todos/123456
app.get('/todos/:id', (req, res) => {
    var {id} = req.params;

    if (!ObjectID.isValid(id)) {
        // console.error(`Invalid Id: GET /todos/${id}`);
        return res.status(404).send();
    }
    
    Todo.findById(id).then((todo) => {
        if (!todo) {
            // console.log('Id not found.');
            return res.status(404).send();
        }
        // console.log(`Todo By Id ${id}`, todo);
        return res.send({todo});
    }).catch((e) => {
        console.log(e);
        return res.status(404).send();
    });
});

app.delete('/todos/:id', (req, res) => {
    var {id} = req.params;
    // console.log('DELETE /todos/:id');

    if (!ObjectID.isValid(id)) {
        // console.error(`Invalid Id: DELETE /todos/${id}`);
        return res.status(404).send();
    }
    
        Todo.findByIdAndRemove(id).then((todo) => {
            if (!todo) {
                // console.log('Unable to remove. Id not found.');
                return res.status(404).send();
            }
            return res.status(200).send({todo});

        }).catch((e) => {
            console.log(e);
            return res.status(400).send();
        });
    });

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
