import * as winston from 'winston';
import * as fs from 'fs';
/**
 * Logger class for handling application logs.
 */
class Logger {
  private loggerMain: winston.Logger;
  private loggerError: winston.Logger;

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
  info(message: string): void {
    this.loggerMain.info(message);
  }

  /**
   * Log a warning message.
   * @param {string} message - The warning message to log.
   */
  warn(message: string): void {
    this.loggerMain.warn(message);
  }

  /**
   * Log an error message.
   * @param {string} message - The error message to log.
   */
  error(message: string): void {
    this.loggerError.error(message);
  }
}

// Export a singleton instance of the Logger
export default new Logger();
