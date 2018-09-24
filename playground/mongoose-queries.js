const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var userId = '5ba48f39e36c33a9726c6816';
User.findById(userId).then((user) => {
    if (!user) {
        return console.log('---------------> USER ID NOT FOUND.');
    }
    console.log('User by Id', JSON.stringify(user, undefined, 2));;
}).catch((e) => console.log(e));

// var id = '5ba6ee4d0c86d3adaa0fd14811';

// if (!ObjectID.isValid(id)) {
//     console.log('Invalid id.');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found.');
//     }
//     console.log('Todo By Id', todo);
// }).catch((e) => console.log(e));



