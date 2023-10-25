// cli.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { readURLs } from './URLFileReader';  // Update the import path accordingly
import { beginEvaluation } from './script';  // Update the import path accordingly
import { readEnv } from './envFileReader';  // Update the import path accordingly
import logger from './logger';  // Update the import path accordingly

const program = new Command();

program
    .version('1.0.0')
    .description('ECE 461 NPM Phase 1');

program
    .command('install')
    .description('Install packages')
    .action(() => {
        logger.info('Installing packages...');
        try {
            execSync(`npm install`, { stdio: 'inherit' });
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Error installing packages: ${error.message}`);
            } else {
                logger.error('An unknown error occurred during package installation.');
            }
            process.exit(1);
        }
    });

program
    .argument('<URL_FILE>', 'Absolute file location to file containing URLs')
    .action(async (urlFile: string) => {
        const env_var: any = await readEnv();
        const urlList: string[] = await readURLs(urlFile);
        await beginEvaluation(urlList, env_var.token);
    });

program
    .command('test')
    .description('Run tests')
    .action(() => {
        try {
            execSync(`cd ../ && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom1.js && npx jest --silent --coverage --coverageReporters=json-summary --config jest.config.custom.js`, { stdio: 'inherit' });
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Error running tests: ${error.message}`);
            } else {
                logger.error('An unknown error occurred during testing.');
            }
            process.exit(1);
        }
    });

program.parse(process.argv);
