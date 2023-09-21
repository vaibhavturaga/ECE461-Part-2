#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const urlFileReader_1 = require("./urlFileReader");
const script_1 = require("./tools/script");
const envFileReader_1 = require("./envFileReader");
const program = new commander_1.Command();
program
    .version('1.0.0')
    .description('ECE 461 NPM Phase 1');
program
    .command('install')
    .description('Install packages')
    .action(() => {
    console.log('Installing packages...');
    // Your install logic here
    try {
        (0, child_process_1.execSync)(`npm install`, { stdio: 'inherit' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error installing packages: ${error.message}`);
        }
        else {
            console.error('An unknown error occurred during package installation.');
        }
        process.exit(1);
    }
});
program
    .argument('<URL_FILE>', 'Absolute file location to file containing URLs')
    .action(async (urlFile) => {
    //console.log(`Processing URL file: ${urlFile}`);
    // Your URL file processing logic here
    const env_var = await (0, envFileReader_1.readEnv)();
    const urlList = await (0, urlFileReader_1.readURLs)(urlFile);
    await (0, script_1.beginEvaluation)(urlList, env_var.token);
});
program
    .command('test')
    .description('Run tests')
    .action(() => {
    console.log('Running tests...');
    // Your test logic here
    try {
        (0, child_process_1.execSync)(`npx jest --coverage`, { stdio: 'inherit' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error running tests: ${error.message}`);
        }
        else {
            console.error('An unknown error occurred during testing.');
        }
        process.exit(1);
    }
});
//console.log('Parsing Arguments')
program.parse(process.argv);
