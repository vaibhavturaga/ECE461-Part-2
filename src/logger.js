"use strict";
exports.__esModule = true;
var winston = require("winston");
/*

This file defines the "logger" object from the class Logger.
The "logger" object has methods .info(string), .warn(string), and .error(string)

To use "logger" in your typescript file, import it like this: "import logger from './logger';"

example uses: "logger.error('ERROR MESSAGE');"

*/
// TODO: 
// have logs output file reset every time the program is run
var Logger = /** @class */ (function () {
    function Logger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log', level: 'info' }),
                new winston.transports.File({ filename: 'logs/combined.log', level: 'warn' }),
            ]
        });
    }
    Logger.prototype.info = function (message) {
        this.logger.info(message);
    };
    Logger.prototype.warn = function (message) {
        this.logger.warn(message);
    };
    Logger.prototype.error = function (message) {
        this.logger.error(message);
    };
    return Logger;
}());
exports["default"] = new Logger();
