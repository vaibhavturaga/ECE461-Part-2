"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginEvaluation = void 0;
const api_1 = require("./api");
const api_2 = require("./api");
const api_3 = require("./api");
const logger_1 = __importDefault(require("../logger"));
async function beginEvaluation(urls, token) {
    //dotenv.config({ path: '.env' });
    //const token: string | undefined = process.env.GITHUB_API_KEY;
    if (!token) {
        logger_1.default.error('GitHub API token not found in the .env file');
        process.exit(1); // Exit the script with an error code
    }
    //Initialize repositories, find their github repositories if npm, make queries to to get the api responses we need.
    // this concurrently process 10 urls at a time
    const Promise = require('bluebird');
    const connectionsAndCommunicators = await Promise.map(urls, async (url) => {
        const connection = await api_1.repoConnection.create(url, token);
        const communicator = await api_2.repoCommunicator.create(connection);
        return { connection, communicator };
    }, { concurrency: 10 });
    //For each pair of connections and communicators (connection finds github api, etc. communicator uses connection to make api queries)
    // we can create a metric instance by feeding the information from the communicator to our evaluater which filters responses
    // and outputs scores.
    connectionsAndCommunicators.forEach((pair) => {
        let metric = new api_3.metricEvaluation(pair.communicator);
        metric.logAll();
    });
}
exports.beginEvaluation = beginEvaluation;
