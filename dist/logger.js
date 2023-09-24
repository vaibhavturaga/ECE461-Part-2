"use strict";
exports.__esModule = true;
var winston = require("winston");
require("dotenv/config");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Silent"] = 0] = "Silent";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Debug"] = 2] = "Debug";
})(LogLevel || (LogLevel = {}));
/**
 * Logger class for handling application logs.
 */
var Logger = /** @class */ (function () {
    /**
     * Create a new Logger instance.
     * @constructor
     */
    function Logger() {
        this.logLevel = this.getLogLevelFromEnv();
        this.logFileName = process.env.LOG_FILE;
        // Check if LOG_FILE and ERROR_LOG are defined; exit with code 0 if not
        if (!this.logFileName) {
            process.exit(1);
        }
        var customFormat = winston.format.printf(function (_a) {
            var message = _a.message;
            return message;
        });
        this.loggerMain = winston.createLogger({
            level: this.logLevel >= LogLevel.Info ? 'info' : 'silent',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
            ]
        });
        this.loggerDebug = winston.createLogger({
            level: 'debug',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
            ]
        });
        this.loggerError = winston.createLogger({
            level: 'error',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
            ]
        });
    }
    /**
     * Get the log level from the environment variable LOG_LEVEL.
     * @private
     */
    Logger.prototype.getLogLevelFromEnv = function () {
        var logLevel = process.env.LOG_LEVEL;
        switch (logLevel) {
            case '0':
                return LogLevel.Silent;
            case '2':
                return LogLevel.Debug;
            case '1':
            default:
                return LogLevel.Info;
        }
    };
    /**
     * Log a debug message.
     * @param {string} message - The debug message to log.
     */
    Logger.prototype.debug = function (message) {
        if (this.logLevel >= LogLevel.Debug) {
            console.log(message);
            this.loggerDebug.debug(message);
        }
    };
    /**
     * Log an information message.
     * @param {string} message - The information message to log.
     */
    Logger.prototype.info = function (message) {
        if (this.logLevel >= LogLevel.Info) {
            console.log(message);
            this.loggerMain.info(message);
        }
    };
    /**
     * Log a warning message.
     * @param {string} message - The warning message to log.
     */
    Logger.prototype.warn = function (message) {
        if (this.logLevel >= LogLevel.Info) {
            console.log(message);
            this.loggerMain.warn(message);
        }
    };
    /**
     * Log an error message.
     * @param {string} message - The error message to log.
     */
    Logger.prototype.error = function (message) {
        this.loggerError.error(message);
    };
    return Logger;
}());
// Export a singleton instance of the Logger
exports["default"] = new Logger();
