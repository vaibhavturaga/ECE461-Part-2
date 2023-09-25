"use strict";
<<<<<<< HEAD
exports.__esModule = true;
var winston = require("winston");
=======
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
>>>>>>> ben_api_communication
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
<<<<<<< HEAD
var Logger = /** @class */ (function () {
=======
class Logger {
>>>>>>> ben_api_communication
    /**
     * Create a new Logger instance.
     * @constructor
     */
<<<<<<< HEAD
    function Logger() {
=======
    constructor() {
>>>>>>> ben_api_communication
        this.logLevel = this.getLogLevelFromEnv();
        this.logFileName = process.env.LOG_FILE;
        // Check if LOG_FILE and ERROR_LOG are defined; exit with code 0 if not
        if (!this.logFileName) {
            process.exit(1);
        }
<<<<<<< HEAD
        var customFormat = winston.format.printf(function (_a) {
            var message = _a.message;
            return message;
        });
=======
        const customFormat = winston.format.printf(({ message }) => message);
>>>>>>> ben_api_communication
        this.loggerMain = winston.createLogger({
            level: this.logLevel >= LogLevel.Info ? 'info' : 'silent',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
<<<<<<< HEAD
            ]
=======
            ],
>>>>>>> ben_api_communication
        });
        this.loggerDebug = winston.createLogger({
            level: 'debug',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
<<<<<<< HEAD
            ]
=======
            ],
>>>>>>> ben_api_communication
        });
        this.loggerError = winston.createLogger({
            level: 'error',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: this.logFileName }),
<<<<<<< HEAD
            ]
=======
            ],
>>>>>>> ben_api_communication
        });
    }
    /**
     * Get the log level from the environment variable LOG_LEVEL.
     * @private
     */
<<<<<<< HEAD
    Logger.prototype.getLogLevelFromEnv = function () {
        var logLevel = process.env.LOG_LEVEL;
=======
    getLogLevelFromEnv() {
        const logLevel = process.env.LOG_LEVEL;
>>>>>>> ben_api_communication
        switch (logLevel) {
            case '0':
                return LogLevel.Silent;
            case '2':
                return LogLevel.Debug;
            case '1':
            default:
                return LogLevel.Info;
        }
<<<<<<< HEAD
    };
=======
    }
>>>>>>> ben_api_communication
    /**
     * Log a debug message.
     * @param {string} message - The debug message to log.
     */
<<<<<<< HEAD
    Logger.prototype.debug = function (message) {
        if (this.logLevel >= LogLevel.Debug) {
            console.log(message);
            this.loggerDebug.debug(message);
        }
    };
=======
    debug(message) {
        console.log(message);
        if (this.logLevel >= LogLevel.Debug) {
            this.loggerDebug.debug(message);
        }
    }
>>>>>>> ben_api_communication
    /**
     * Log an information message.
     * @param {string} message - The information message to log.
     */
<<<<<<< HEAD
    Logger.prototype.info = function (message) {
        if (this.logLevel >= LogLevel.Info) {
            console.log(message);
            this.loggerMain.info(message);
        }
    };
=======
    info(message) {
        console.log(message);
        if (this.logLevel >= LogLevel.Info) {
            this.loggerMain.info(message);
        }
    }
>>>>>>> ben_api_communication
    /**
     * Log a warning message.
     * @param {string} message - The warning message to log.
     */
<<<<<<< HEAD
    Logger.prototype.warn = function (message) {
        if (this.logLevel >= LogLevel.Info) {
            console.log(message);
            this.loggerMain.warn(message);
        }
    };
=======
    warn(message) {
        console.log(message);
        if (this.logLevel >= LogLevel.Info) {
            this.loggerMain.warn(message);
        }
    }
>>>>>>> ben_api_communication
    /**
     * Log an error message.
     * @param {string} message - The error message to log.
     */
<<<<<<< HEAD
    Logger.prototype.error = function (message) {
        this.loggerError.error(message);
    };
    return Logger;
}());
// Export a singleton instance of the Logger
exports["default"] = new Logger();
=======
    error(message) {
        this.loggerError.error(message);
    }
}
// Export a singleton instance of the Logger
exports.default = new Logger();
>>>>>>> ben_api_communication
