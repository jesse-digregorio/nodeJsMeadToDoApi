var env = process.env.NODE_ENV || 'development';
console.log('env *******', env);

switch(env) {
    case 'development':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/TodoApp';
        break;
    case 'test':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/TodoAppTest';
        break;
    default:
        // meh.
}
