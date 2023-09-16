import {repoConnection} from './api'
import {repoCommunicator }from './api'
import {metricEvaluation} from './api'
import * as dotenv from 'dotenv'
async function setupCommunication(urls: string[]) {
    dotenv.config({ path: '.env' });
    const token: string | undefined = process.env.GITHUB_API_KEY;
  
    if (!token) {
        console.error('GitHub API token not found in the .env file');
        process.exit(1); // Exit the script with an error code
      }
    const startUsingPromiseAll = performance.now();
    
    // Create an array of promises to initialize connections and communicators for each URL
    /*
    const connectionsAndCommunicators = await Promise.all(urls.map(async (url) => {
      const connection = await repoConnection.create(url, token);
      const communicator = await repoCommunicator.create(connection);
      return { connection, communicator };
    }));*/
    const Promise = require('bluebird');
    const connectionsAndCommunicators = await Promise.map(urls, async (url: string) => {
      const connection = await repoConnection.create(url, token);
      const communicator = await repoCommunicator.create(connection);
      return { connection, communicator };
    }, { concurrency: 10 });
    //console.log(connectionsAndCommunicators[0])
    const endUsingPromiseAll = performance.now();
    const usingPromiseAllTime = endUsingPromiseAll - startUsingPromiseAll;
    console.log(`Promise.all time: ${usingPromiseAllTime}`);
    //console.log(connectionsAndCommunicators[0].communicator.issues)
    connectionsAndCommunicators.forEach((pair: any)=>{
        let metric = new metricEvaluation(pair.communicator)
        console.log(pair.connection.url)
        //metric.filterIssues();
        metric.getResponsiveness()
        metric.getBus();
        //metric.filterlicense();
    })
  }
  
  const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
  setupCommunication(urls);