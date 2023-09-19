"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnv = void 0;
const fsPromise = __importStar(require("fs/promises"));
const readEnv = async () => {
    var token = "";
    var logLevel = "";
    var logFile = "";
    await fsPromise.open("./.env", 'r')
        .then(async (response) => {
        for await (const line of response.readLines()) {
            if (line.includes("GITHUB_TOKEN=")) {
                token = line.replace("GITHUB_TOKEN=", "");
            }
            else if (line.includes("LOG_LEVEL=")) {
                logLevel = line.replace("LOG_LEVEL=", "");
            }
            else if (line.includes("LOG_FILE=")) {
                logFile = line.replace("LOG_FILE=", "");
            }
        }
    })
        .catch((error) => {
        console.error(`.env file not found`);
    });
    return { token: token, logLevel: logLevel, logFile: logFile };
};
exports.readEnv = readEnv;
/*export const testEnv = async () => {
    var env = await readEnv();
    console.log(env);
}
testEnv();*/
