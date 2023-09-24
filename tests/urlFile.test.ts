import { readURLs } from '../src/urlFileReader';
import * as path from 'path';
import { describe, test, expect } from '@jest/globals';

describe('URL_FILE', () => {
    // Function to check if a url file exists, if not, create it
    
    test('returns correct array', async () => {
        let testArray = ["https://www.npmjs.com/package/is-regex", "https://www.npmjs.com/package/path-to-regexp", "https://www.npmjs.com/package/escape-string-regexp", "https://github.com/es-shims/RegExp.prototype.flags", "https://github.com/ljharb/safe-regex-test", "https://github.com/npm/hosted-git-info", "https://www.npmjs.com/package/@octokit/rest"]

        // Grab the urls
        let urls = await readURLs(path.join(__dirname, '../tests/urlTestFile.txt'));

        // Expect that the return array contains the urls
        expect(JSON.stringify(urls)).toBe(JSON.stringify(testArray));
    });

    test('errors when file not found', async () => {
        const errorSpy = jest.spyOn(global.console, 'error');

        // Try to use a non existant file
        let urls = await readURLs('notReal.txt');

        // Expect that the return array contains the urls
        expect(errorSpy).toBeCalled();
    });

    // Additional test cases can be added here as needed
});
