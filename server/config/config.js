var env = process.env.NODE_ENV || 'development';
console.log('env *******', env);

switch(env) {
    case 'development':
        code block
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
        break;
    case 'test':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
        break;
    default:
        // meh.
}
