import * as winston from 'winston';
 
/* 

This file defines the "logger" object from the class Logger.
The "logger" object has methods .info(string), .warn(string), and .error(string)

To use "logger" in your typescript file, import it like this: "import logger from './logger';"

example uses: "logger.error('ERROR MESSAGE');"

*/

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // Set the log level to 'info' or any desired level
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }
}

export default new Logger();
