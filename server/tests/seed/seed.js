const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const testUsers = [
    {
        _id: userOneId,
        email: 'fivePrawns@wtf.com',
        password: 'notcool1',
        tokens: [{
                access: 'auth',
                token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
            }]
    },
    {
        _id: userTwoId,
        email: 'fivePrawns1@wtf.com',
        password: 'notcool2'
    }
];

const testTodos = [
    { _id: new ObjectID(), text: 'first todo'},
    { _id: new ObjectID(), text: 'second todo'},
    { _id: new ObjectID(), text: 'thrid todo',
                          completed: true,
                          completedAt: 333 }
];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(testTodos);
    }).then(
        () => { done(); }
    )
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
// console.log('BEFORE PROMISING 1 & 2');
        var userOne = new User(testUsers[0]).save();
        var userTwo = new User(testUsers[1]).save();
// console.log('PROMISING 1 & 2');
        return Promise.all([userOne, userTwo]);
    }).then(() => { done(); }
    );
};

module.exports = { testTodos, populateTodos, testUsers, populateUsers };
