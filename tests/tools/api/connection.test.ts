import {repoConnection} from '../../../src/tools/api';
import {describe, test, expect, beforeAll} from '@jest/globals';
import logger from '../../../src/logger';
import * as dotenv from 'dotenv'


// globals
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
const githubUrls: string[] = ['https://github.com/browserify/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://github.com/expressjs/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
const repos: string[] = ['browserify', 'cloudinary_npm', 'express', 'nodist', 'lodash'];
const orgs: string[] = ['browserify', 'cloudinary', 'expressjs', 'nullivex', 'lodash'];

process.env.DOTENV_CONFIG_PATH = '../../../.env';
dotenv.config();
const token: string | undefined = process.env.GITHUB_TOKEN;
if (!token) {
    expect(token).toBeDefined();
    logger.error('GitHub API token not found in the .env file');
    throw new Error;
}


describe('repoConnection', () => {
    // testing with globals
    urls.forEach((url, i) => {
        let connection : repoConnection;

        beforeAll(async () => {
            connection = await repoConnection.create(url, token);
        });

        // creating a repoConnection object
        test(`create ${i}`, () => {
            expect(connection).toBeDefined();
            expect(connection.githubkey).toBe(token);
            expect(connection.urlFromFile).toBe(urls[i]);
            expect(connection.url).toBe(githubUrls[i]);
            expect(connection.repo).toBe(repos[i]);
            expect(connection.org).toBe(orgs[i]);
        });

        // testing queryGithubapi
        test.each(['/commits', '', '/issues?state=closed', '/issues?state=open'])(`queryGithubAPI for current URL${i}`, async (query) => {
            const response = await connection.queryGithubapi(query);
            expect(response).not.toBeNull(); // should not be null for this test
        });

        // TODO currently this test does not work due to running process.exit(1) after a failing query, need to discuss with Ben
        // testing bad queryGithubapi
        // test.failing('queryGithubAPI for bad URL', async () => {
        //     const response = await connection.queryGithubapi('/badquery');
        // });
    });

    // TODO unsure how to test this, need to discuss with Ben
    // testing for bad url
    // test('create bad url', async () => {
    //     const badUrl = 'https://www.npmjs.com/package/express';
    //     const connection = await repoConnection.create(badUrl, token);
    //     expect(connection).toBeNull();
    // });
});