"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const fs = __importStar(require("fs"));
/**
 * Logger class for handling application logs.
 */
class Logger {
    /**
     * Create a new Logger instance.
     * @constructor
     */
    constructor() {
        const dotenv = require('dotenv');
        dotenv.config({ path: '.env' });
        const customFormat = winston.format.printf(({ message }) => message);
        const log_file = process.env.LOG_FILE;
        if (!log_file || !fs.existsSync(log_file)) {
            process.exit(1);
        }
        // Logger for info and warn messages
        this.loggerMain = winston.createLogger({
            level: 'info',
            format: customFormat,
            transports: [
                new winston.transports.Console({ level: 'info' }),
                new winston.transports.File({ filename: log_file }),
            ],
        });
        // Logger for error messages
        this.loggerError = winston.createLogger({
            level: 'error',
            format: customFormat,
            transports: [
                new winston.transports.File({ filename: 'logs/error.log' }),
                new winston.transports.File({ filename: log_file }),
            ],
        });
    }
    /**
     * Log an information message.
     * @param {string} message - The information message to log.
     */
    info(message) {
        this.loggerMain.info(message);
    }
    /**
     * Log a warning message.
     * @param {string} message - The warning message to log.
     */
    warn(message) {
        this.loggerMain.warn(message);
    }
    /**
     * Log an error message.
     * @param {string} message - The error message to log.
     */
    error(message) {
        this.loggerError.error(message);
    }
}
// Export a singleton instance of the Logger
exports.default = new Logger();
