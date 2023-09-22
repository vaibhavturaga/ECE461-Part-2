import * as winston from 'winston';
 
/* 

This file defines the "logger" object from the class Logger.
The "logger" object has methods .info(string), .warn(string), and .error(string)

To use "logger" in your typescript file, import it like this: "import logger from './logger';"

example uses: "logger.error('ERROR MESSAGE');"

*/

// TODO: 
// have logs output file reset every time the program is run

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // Set the log level to 'info' or any desired level
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log', level: 'info'}),
        new winston.transports.File({ filename: 'logs/combined.log', level: 'warn'}),
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
