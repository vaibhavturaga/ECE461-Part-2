import { readEnv } from '../src/envFileReader';
import { describe, test, expect } from '@jest/globals';

describe('env_reader', () => {
    // Function to check if a url file exists, if not, create it
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
    
    test('returns correct object', async () => {

        // Grab the env object
        let env = await readEnv();

        // Expect that the return array contains the urls
        expect(parseInt(env.logLevel)).toBeGreaterThanOrEqual(0);
        expect(parseInt(env.logLevel)).toBeLessThanOrEqual(2);
        expect(env.token).toBeDefined();
        expect(env.logFile).toBeDefined();
    });

    // Additional test cases can be added here as needed
});
