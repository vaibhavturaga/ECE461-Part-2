import * as winston from 'winston';
import 'dotenv/config';

enum LogLevel {
  Silent = 0,
  Info = 1,
  Debug = 2,
}

/**
 * Logger class for handling application logs.
 */
class Logger {
  private loggerMain: winston.Logger;
  private loggerDebug: winston.Logger;
  private loggerError: winston.Logger;
  private logLevel: LogLevel;
  private logFileName: string | undefined;

  /**
   * Create a new Logger instance.
   * @constructor
   */
  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.logFileName = process.env.LOG_FILE;
  
    // Check if LOG_FILE is defined; exit with code 1 if not
    if (!this.logFileName) {
      process.exit(0);
    }

    const customFormat = winston.format.printf(({ message }) => message);

    this.loggerMain = winston.createLogger({
      level: this.logLevel >= LogLevel.Info ? 'info' : 'silent',
      format: customFormat,
      transports: [
        new winston.transports.File({ filename: this.logFileName }),
      ],
    });

    this.loggerDebug = winston.createLogger({
      level: 'debug',
      format: customFormat,
      transports: [
        new winston.transports.File({ filename: this.logFileName }),
      ],
    });

    this.loggerError = winston.createLogger({
      level: 'error',
      format: customFormat,
      transports: [
        new winston.transports.File({ filename: this.logFileName }),
      ],
    });
  }

  /**
   * Get the log level from the environment variable LOG_LEVEL.
   * @private
   */
  private getLogLevelFromEnv(): LogLevel {
    const logLevel = process.env.LOG_LEVEL;

    switch (logLevel) {
      case '0':
        return LogLevel.Silent;
      case '2':
        return LogLevel.Debug;
      case '1':
      default:
        return LogLevel.Info;
    }
  }

  /**
   * Log a debug message.
   * @param {string} message - The debug message to log.
   */
  debug(message: string): void {
      console.log(message);
    if (this.logLevel >= LogLevel.Debug) {
      this.loggerDebug.debug(message);
    }
  }

  /**
   * Log an information message.
   * @param {string} message - The information message to log.
   */
  info(message: string): void {
      console.log(message);
    if (this.logLevel >= LogLevel.Info) {
      this.loggerMain.info(message);
    }
  }

  /**
   * Log a warning message.
   * @param {string} message - The warning message to log.
   */
  warn(message: string): void {
      console.log(message);
    if (this.logLevel >= LogLevel.Info) {
      this.loggerMain.warn(message);
    }
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
