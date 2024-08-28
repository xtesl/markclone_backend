const winston = require('winston');


//custom log levels for api request and response
const customLevels = {
    response: {level:"info", label:"API Response"},
    request: {level:"info", label:"API Request"}
};


//logger
const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    transports: [
        new winston.transports.File({
            filename: "api.log",
            level: "info"
        })
    ],
    exitOnError: false
});

//extend the levels with custom levels

const info = [{
    name:'Asare',
    age:19
}];

logger.log(customLevels.request.level, info);
