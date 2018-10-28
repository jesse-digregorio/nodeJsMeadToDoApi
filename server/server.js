require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const mongoose = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

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

app.patch('/todos/:id', (req, res) => {
    var {id} = req.params;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id,
        { $set: body },
        { new: true }
    ).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.sgtatus(400).send();
    });
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
        // res.send(user);
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});








app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
