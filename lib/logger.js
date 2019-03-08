const winston = require('winston');
const config = require('../config');

const logFile = process.env.NODE_ENV === 'production' ? config.appLogFile : './applogs.log';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: logFile,
            handleExceptions: true
        })
    ]
});

// console for dev
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        handleExceptions: true
    }));
}

module.exports = logger;
