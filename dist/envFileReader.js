"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnv = void 0;
const readEnv = async () => {
    let token = "";
    let logLevel = "";
    let logFile = "";
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env' });
    token = process.env.GITHUB_TOKEN;
    logLevel = process.env.LOG_LEVEL;
    logFile = process.env.LOG_FILE;
    return { token: token, logLevel: logLevel, logFile: logFile };
};
exports.readEnv = readEnv;
