const mongoose = require('mongoose');
const validator = require('validator');

// {
//     email: 'jesse@example.com',
//     password: 'myPass123',
//     tokens: [{
//         access: 'auth',
//         token: ''
//     }]
//
// }

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: (value) => {
                validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

module.exports = {User}
