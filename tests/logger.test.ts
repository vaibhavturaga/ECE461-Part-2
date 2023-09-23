import logger from '../src/logger';
import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Logger', () => {
    // Function to check if a log file exists, if not, create it
    const ensureLogFileExists = (logFilePath: string) => {
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
    };

    beforeAll(() => {
        // Ensure the logs directory exists before running the tests
        const logsDirectory = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDirectory)) {
            fs.mkdirSync(logsDirectory);
        }

        // Check and create log files if necessary
        ensureLogFileExists(path.join(__dirname, '../logs/error.log'));
        ensureLogFileExists(path.join(__dirname, '../logs/combined.log'));
    });

    test('logs info messages correctly', async () => {
        // Log an info message
        logger.info('This is an info message');

        // Construct the path to the combined.log file
        const logFilePath = path.join(__dirname, '../logs/combined.log');

        // Wait for a short time to allow Winston to create and write to the log file
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Read the contents of the log file
        const logFileContents = fs.readFileSync(logFilePath, 'utf8');

        // Expect that the log file contains the info message
        expect(logFileContents).toContain('This is an info message');
    });

    test('logs warn messages correctly', async () => {
        // Log a warn message
        logger.warn('This is a warning message');

        // Construct the path to the combined.log file
        const logFilePath = path.join(__dirname, '../logs/combined.log');

        // Wait for a short time to allow Winston to create and write to the log file
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Read the contents of the log file
        const logFileContents = fs.readFileSync(logFilePath, 'utf8');

        // Expect that the log file contains the warn message
        expect(logFileContents).toContain('This is a warning message');
    });

    test('logs error messages correctly', async () => {
        // Log an error message
        logger.error('This is an error message');

        // Construct the path to the error.log file
        const errorLogFilePath = path.join(__dirname, '../logs/error.log');

        // Wait for a short time to allow Winston to create and write to the log file
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Read the contents of the error.log file
        const errorLogFileContents = fs.readFileSync(errorLogFilePath, 'utf8');

        // Expect that the error.log file contains the error message
        expect(errorLogFileContents).toContain('This is an error message');
    });

    // Additional test cases can be added here as needed

});
