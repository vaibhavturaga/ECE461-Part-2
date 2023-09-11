import logger from '../src/logger';

let globalMessage = 'test message';

// tests work, but unsure why my IDE (vscode) says there is a problem with describe and test
// either way, when running the tests with "npx jest", they work fine
// for code coverage (100%), run "npx jest --coverage"
describe('logger', () => {
    test('logger.info', () => {
        logger.info(globalMessage);
    });
    test('logger.warn', () => {
        logger.warn(globalMessage);
    });
    test('logger.error', () => {    
        logger.error(globalMessage);
    });
});