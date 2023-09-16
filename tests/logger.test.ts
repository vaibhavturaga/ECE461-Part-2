import logger from '../src/logger';

let globalMessage = 'test message';

// TODO: expand on current tests, these are basic tests to get started and demonstrate describe and test
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