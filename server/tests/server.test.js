const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {
    testTodos,
    populateTodos,
    testUsers,
    populateUsers
    } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        var text = '';

        request(app)
            .post('/todos')
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({text})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(testTodos.length);
                    done();
                }).catch((e) => done(e));
            });
    });

}); //POST /todos

describe('GET /todos', () => {

    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
}); //GET /todos

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        // console.log('THIS IS WHAT I AM ASKING FOR: ', `/todos/${testTodos[0]._id.toHexString()}`);
        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                // console.log('RES - ' + res.body.todo.text);
                // console.log('TST - ' + testTodos[0].text);
                expect(res.body.todo.text).toBe(testTodos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by another user', (done) => {
        // console.log('THIS IS WHAT I AM ASKING FOR: ', `/todos/${testTodos[0]._id.toHexString()}`);
        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var soughtId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${soughtId}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        var soughtNonId = '8675309';
        request(app)
            .get(`/todos/${soughtNonId}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
}); //GET /todos/:id

describe('DELETE /todos/:id', () => {
    it('should remove a todo doc', (done) => {
        var hexId = testTodos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not remove a todo for a different user', (done) => {
        var hexId = testTodos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var soughtId = new ObjectID();
        request(app)
            .get(`/todos/${soughtId.toHexString()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        var soughtNonId = '8675309';
        request(app)
            .delete(`/todos/${soughtNonId}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

}); //DELETE /todos/:id

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var hexId = testTodos[0]._id.toHexString();
        var testText = 'testing PATCH';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .send({ text: testText, completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testText);
                expect(res.body.todo.completed).toBe(true);
                // expect(res.body.todo.completedAt).toBeA('number');
                expect(typeof res.body.todo.completedAt).toBe('number');
                done();
            }).catch((e) => done(e));
        });

        it('should not update todo created by another user', (done) => {
            var hexId = testTodos[2]._id.toHexString();
            var testText = 'testing PATCH';

            request(app)
                .patch(`/todos/${hexId}`)
                .set('x-auth', testUsers[0].tokens[0].token)
                .send({ text: testText, completed: true })
                .expect(404)
                .end(done);
            });

    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = testTodos[2]._id.toHexString();
        var testText = 'testing PATCH';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', testUsers[1].tokens[0].token)
            .send({ text: testText, completed: false })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testText);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeFalsy();
                done();
            }).catch((e) => done(e));
        });
    }); //PATCH /todos/:id

    describe('GET /users/me', () => {
        it('should return user if authenticated', (done) => {
            request(app)
                .get('/users/me')
                .set('x-auth', testUsers[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBe(testUsers[0]._id.toHexString());
                    expect(res.body.email).toBe(testUsers[0].email);
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            request(app)
                .get('/users/me')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual({});
                })
                .end(done);
        });
    }); //GET /users/me

    describe('POST /users', () => {
        it('should create a user', (done) => {
            var email = 'example@example.com';
            var password = '123mnb!';
            var requestData = { email, password };

            request(app)
                .post('/users')
                // .send({email, password})
                .send(requestData)
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.email).toBe(email);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({email}).then((user) => {
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    }).catch((e) => { done (e)});
                });
        });

        it('should return validation errors if request is invalid', (done) => {
            var email = 'example';
            var password = '123';   // password is too short
            var requestData = { email, password };

            request(app)
                .post('/users')
                .send(requestData)
                .expect(400)
                .end(done);
        });

        it('should not create user if email in use', (done) => {
            var email = testUsers[0].email; // email is in use
            var password = 'mnb123!';
            var requestData = { email, password };

            request(app)
                .post('/users')
                .send(requestData)
                .expect(400)
                .end(done);
        });

}); //POST /users

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
         request(app)
            .post('/users/login')
            .send({
                email: testUsers[1].email,
                password: testUsers[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(testUsers[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => { done (e)});
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
           .post('/users/login')
           .send({
               email: testUsers[1].email,
               password: `${testUsers[1].password}incorrect`
           })
           .expect(400)
           .expect((res) => {
               expect(res.headers['x-auth']).toBeFalsy();
           })
           .end((err, res) => {
               if (err) {
                   return done(err);
               }

               User.findById(testUsers[1]._id).then((user) => {
                   expect(user.tokens.length).toBe(testUsers[1].tokens.length);
                   done();
               }).catch((e) => { done(e) });
           });

    });
}); // POST /users/login

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(testUsers[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => { done(e) });
            });

    });
});

// describe('CLASSROOM EXAMPLE - DELETE /users/me/token', () => {
//   it('should remove auth token on logout', (done) => {
//     request(app)
//       .delete('/users/me/token')
//       .set('x-auth', testUsers[0].tokens[0].token)
//       .expect(200)
//       .end((err, res) => {
//         if (err) {
//           return done(err);
//         }
//
//         User.findById(testUsers[0]._id).then((user) => {
//           expect(user.tokens.length).toBe(0);
//           done();
//         }).catch((e) => done(e));
//       });
//   });
// });
