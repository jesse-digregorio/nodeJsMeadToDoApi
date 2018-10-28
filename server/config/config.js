var env = process.env.NODE_ENV || 'development';
console.log('env *******', env);

if (env === 'developemnt' || env === 'test') {
    var config = require('./config.json');
    console.log(config);

    var envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}


var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    var config = require('./config.json');
    var envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
