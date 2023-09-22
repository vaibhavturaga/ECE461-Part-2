"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoCommunicator = exports.repoConnection = void 0;
const axios_1 = __importDefault(require("axios"));
const query_registry_1 = require("query-registry");
const logger_1 = __importDefault(require("../logger"));
/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Interface for requesting information from github repository. Is used by communicator class
 *
 * TODO:
 * 1. better error handling: can't access github repo, can't access npm package, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 *
 * Completed:
 * 1. imported logger and swapped any console writes with logger calls
 * 2. Handling status 202 (successful request repsonse not ready) and 403 (timeout we do exponential decay)
 **************************************************************************************************************************************/
/* e.g. how to initialize connection
      (async () => {
      const npmrepo = new repoCommunicator(npm);

      // Wait for the initialization to complete
        await npmrepo.waitForInitialization();

        // Now that the object is initialized, you can call instance methods like getissues
        npmrepo.getissues();
      })();
*/
class repoConnection {
    constructor(url, githubkey) {
        this.urlFromFile = null;
        this.error_occurred = false;
        this.initializationPromise = null;
        this.urlFromFile = url;
        this.githubkey = githubkey;
        this.url = null;
        this.repo = '';
        this.org = '';
        this.initializationPromise = this.initialize(url);
    }
    initialize(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const processedUrl = yield this.processUrl(url);
                if (processedUrl) {
                    const urlParts = processedUrl.split('/');
                    this.org = urlParts[urlParts.length - 2];
                    this.repo = urlParts[urlParts.length - 1].split('.')[0];
                    this.url = processedUrl;
                }
                else {
                    logger_1.default.error(`Initialization failed: Github URL not Found. for ${this.url}`);
                    this.error_occurred = true;
                }
            }
            catch (error) {
                logger_1.default.error(`${error}`); // Rethrow the error to propagate it to the caller
            }
        });
    }
    //This can be called from other functions when first initializing the class to know when initilization is complete. example code for when intializing instance
    waitForInitialization() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initializationPromise) {
                return Promise.resolve();
            }
            return this.initializationPromise;
        });
    }
    processUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url.includes("npmjs")) {
                try {
                    const githubRepoUrl = yield this.queryNPM(url);
                    return githubRepoUrl;
                }
                catch (error) {
                    if (error instanceof Error) {
                        logger_1.default.error(`${error}`); // Rethrow the error to propagate it to the caller
                    }
                    else {
                        logger_1.default.error(`An unknown error occurred: ${error}`);
                    }
                    this.error_occurred = true;
                    return null;
                }
            }
            else {
                return url;
            }
        });
    }
    queryNPM(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlParts = url.split('/');
            const packageName = urlParts[urlParts.length - 1].split('.')[0];
            try {
                const packageInfo = yield (0, query_registry_1.getPackageManifest)({ name: packageName });
                if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
                    return packageInfo.gitRepository.url;
                }
                return null;
            }
            catch (_a) {
                logger_1.default.error(`Failed to get information about npm repository: ${this.url}`);
                return null;
            }
        });
    }
    // ex goal: https://api.github.com/repos/browserify/browserify
    // ex endpoint: '/commits', '', '/issues?state=closed', '/issues?state=open'
    queryGithubapi(queryendpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const axiosInstance = axios_1.default.create({
                    baseURL: 'https://api.github.com/',
                    headers: {
                        Authorization: `token ${this.githubkey}`,
                        Accept: 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28', // Add the version header here
                    },
                });
                const endpoint = `repos/${this.org}/${this.repo}${queryendpoint}`;
                let response;
                let count = 10; // Maximum retry count for 202 responses
                let retries = 0;
                do {
                    response = yield axiosInstance.get(endpoint);
                    if (response.status === 202) {
                        // If the response is 202, it means the request is still processing.
                        // Wait for a while before retrying, and decrement the count.
                        count--;
                        yield new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the polling interval as needed.
                    }
                    else if (response.status === 403) {
                        // Implement exponential backoff for 403 responses.
                        if (!retries) {
                            logger_1.default.error(`Rate limit exceeded on ${this.url} applying exponential backoff`);
                        }
                        retries++;
                        const maxRetryDelay = 60000; // Maximum delay between retries (in milliseconds).
                        const retryDelay = Math.min(Math.pow(2, retries) * 1000, maxRetryDelay); // Exponential backoff formula.
                        yield new Promise((resolve) => setTimeout(resolve, retryDelay));
                    }
                } while ((response.status === 202 && count > 0) || response.status === 403);
                return response;
            }
            catch (error) {
                logger_1.default.error(`${error}`);
                this.error_occurred = true;
                return null;
            }
        });
    }
    static create(url, githubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new repoConnection(url, githubkey);
            yield instance.waitForInitialization();
            return instance;
        });
    }
}
exports.repoConnection = repoConnection;
/****************************************************************************************************************************************
 * repoCommunicator
 * 1. takes in a repoConnection
 * 2. Uses connection to query github api for contributors, commits and general repository information. It runs all of these queries concurrently
 * using promise.all this helps with efficiency
 * 3. We then store the responses to this class.
 * 4. We have an evaluate function in metriceval.ts that uses the response data
 *
 **************************************************************************************************************************************/
class repoCommunicator {
    constructor(connection) {
        this.initializationPromise = null;
        this.contributors = null;
        this.commits = null;
        this.general = null;
        this.connection = connection;
        if (!this.connection.error_occurred) {
            this.initializationPromise = this.retrieveAllInfo();
        }
    }
    retrieveAllInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const asyncFunctions = [
                this.getcontributors.bind(this),
                this.getCommits.bind(this),
                this.getGeneral.bind(this),
                // Add more async functions as needed
            ];
            try {
                yield Promise.all(asyncFunctions.map(fn => fn()));
            }
            catch (error) {
                // Handle errors
                logger_1.default.error(`${error}`);
                process.exit(1);
            }
        });
    }
    waitForInitialization() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initializationPromise) {
                return Promise.resolve();
            }
            return this.initializationPromise;
        });
    }
    getGeneral() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.connection.queryGithubapi('');
                if (response) {
                    this.general = response.data;
                }
            }
            catch (error) {
                logger_1.default.error(`${error}`);
            }
        });
    }
    getCommits() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.connection.queryGithubapi('/commits');
                if (response) {
                    this.commits = response.data;
                }
            }
            catch (error) {
                logger_1.default.error(`${error}`);
            }
        });
    }
    getcontributors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.connection.queryGithubapi('/stats/contributors');
                if (response) {
                    this.contributors = response.data;
                    //console.log(`${this.connection.url} ${response.status}`)
                }
            }
            catch (error) {
                logger_1.default.error(`${error}`);
            }
        });
    }
    static create(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new repoCommunicator(connection);
            yield instance.waitForInitialization();
            return instance;
        });
    }
}
exports.repoCommunicator = repoCommunicator;
