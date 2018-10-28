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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(testTodos.length);
            })
            .end(done);
    });
}); //GET /todos

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        // console.log('THIS IS WHAT I AM ASKING FOR: ', `/todos/${testTodos[0]._id.toHexString()}`);
        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                // console.log('RES - ' + res.body.todo.text);
                // console.log('TST - ' + testTodos[0].text);
                expect(res.body.todo.text).toBe(testTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var soughtId = new ObjectID();
        request(app)
            .get(`/todos/${soughtId.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        var soughtNonId = '8675309';
        request(app)
            .get(`/todos/${soughtNonId}`)
            .expect(404)
            .end(done);
    });
}); //GET /todos/:id

describe('DELETE /todos/:id', () => {
    it('should remove a todo doc', (done) => {
        var hexId = testTodos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var soughtId = new ObjectID();
        request(app)
            .get(`/todos/${soughtId.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        var soughtNonId = '8675309';
        request(app)
            .delete(`/todos/${soughtNonId}`)
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
            .send({ text: testText, completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testText);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
                done();
            }).catch((e) => done(e));
        });

    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = testTodos[2]._id.toHexString();
        var testText = 'testing PATCH';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ text: testText, completed: false })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testText);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
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
                    expect(res.headers['x-auth']).toExist();
                    expect(res.body._id).toExist();
                    expect(res.body.email).toBe(email);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({email}).then((user) => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    })
                    .catch((e) => {console.log('CAUGHT: ', e)});
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
