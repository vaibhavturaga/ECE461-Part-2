import {repoConnection} from './api'
import {repoCommunicator} from './api'
import {metricEvaluation} from './api'
import * as dotenv from 'dotenv'
import logger from '../logger';

export async function beginEvaluation(urls: string[], token: string) {
    //dotenv.config({ path: '.env' });
    //const token: string | undefined = process.env.GITHUB_API_KEY;
  
    if (!token) {
        logger.error('GitHub API token not found in the .env file');
        process.exit(1); // Exit the script with an error code
      }
    
    //Initialize repositories, find their github repositories if npm, make queries to to get the api responses we need.
    // this concurrently process 10 urls at a time
    const Promise = require('bluebird');
    const connectionsAndCommunicators = await Promise.map(urls, async (url: string) => {
      const connection = await repoConnection.create(url, token);
      const communicator = await repoCommunicator.create(connection);
      return { connection, communicator };
    }, { concurrency: 10 });

    //For each pair of connections and communicators (connection finds github api, etc. communicator uses connection to make api queries)
    // we can create a metric instance by feeding the information from the communicator to our evaluater which filters responses
    // and outputs scores.
    connectionsAndCommunicators.forEach((pair: any)=>{
        logger.info(pair.connection.urlFromFile)
        let metric = new metricEvaluation(pair.communicator)
        //console.log(metric.busFactor)
        //console.log(metric.communicator.contributors)
        metric.logAll();
    })
  }
  
  const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
  beginEvaluation(urls, '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');