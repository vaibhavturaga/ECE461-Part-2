import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
import { getPackageManifest } from 'query-registry';

/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Request Github Repository. This can be separated into different functions to request for issues, contributors, etc.
 * 
 * TODO:
 * 1. Error handling, can't access github repo, can't access npm package, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
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
class repoConnection{
  url: string | null;
  npm_url: string | null = null; 
  githubkey: string | null;
  repo: string;
  org: string;
  private initializationPromise: Promise<void> | null = null;
  
  constructor(url: string, githubkey: string) {
    this.githubkey = githubkey;
    this.url = null;
    this.repo = '';
    this.org = '';
    this.initializationPromise = this.initialize(url);
  }
  async initialize(url: string): Promise<void> {
    try {
      const processedUrl = await this.processUrl(url);
      if (processedUrl) {
        const urlParts: string[] = processedUrl.split('/');
        this.org = urlParts[urlParts.length - 2];
        this.repo = urlParts[urlParts.length - 1].split('.')[0];
        this.url = processedUrl;
      } else {
        throw Error('Initialization failed: Github URL not Found.');
      }
    } catch (error) {
      throw error; // Rethrow the error to propagate it to the caller
    }
  }
  //This can be called from other functions when first initializing the class to know when initilization is complete. example code for when intializing instance
  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }
  async processUrl(url: string): Promise<string | null> {
    if (url.includes("npmjs")) {
      this.npm_url = url;
      try {
        const githubRepoUrl = await this.queryNPM(url);
        if (githubRepoUrl) {
          //console.log(`The GitHub repository for ${url} is: ${githubRepoUrl}`);
          return githubRepoUrl;
        } else {
          return null;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw Error(`An unknown error occurred: ${error}`)
        }
      }
    } 
    else {
      return url;
    }
  }
  async queryNPM(url: string): Promise<any>{
    const urlParts: string[] = url.split('/');
    const packageName: string = urlParts[urlParts.length - 1].split('.')[0];
    const packageInfo = await getPackageManifest({ name: packageName });

    if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
      return packageInfo.gitRepository.url;
    }
    return null;
  }
  async queryGithubapi(queryendpoint: string): Promise<AxiosResponse<any[]> | null>{
    try{
      const axiosInstance = axios.create({
          baseURL: 'https://api.github.com/',
          headers:{
              Authorization: `token ${this.githubkey}`,
              Accept: 'application/json'
          },
      });
      const endpoint: string = `repos/${this.org}/${this.repo}${queryendpoint}`
      const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
      return response;
    }
    catch(error){
        throw error;
    }
  }
  static async create(url: string, githubkey: string): Promise<repoConnection> {
    const instance = new repoConnection(url, githubkey);
    await instance.waitForInitialization();
    return instance;
  }
}
/****************************************************************************************************************************************
 * repoCommunicator
 * 1. takes in a repoConnection
 * 2. Uses connection to query github api for issues, contributors, commits and general repository information. It runs all of these queries concurrently
 * using promise.all this helps with efficiency
 * 3. We then store the responses to this class. I am thinking we have an evlauate function that parses and calculates metrics
 * 
 * TODO:
 * 1. Error handling, can't access github repo through connection, too many requests, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 **************************************************************************************************************************************/
class repoCommunicator {
  connection: repoConnection;
  private initializationPromise: Promise<void> | null = null;
  issues: any[] | null = null;
  contributors: any[] | null = null;
  constructor(connection: repoConnection){
    this.connection = connection;
    this.initializationPromise = this.retrieveAllInfo();
  }
  async retrieveAllInfo(): Promise<void>{
    const asyncFunctions: (() => Promise<void>)[] = [
      this.getissues.bind(this),
      this.getcontributors.bind(this),
      this.getCommits.bind(this),
      this.getGeneral.bind(this),
      // Add more async functions as needed
    ];
    try {
      await Promise.all(asyncFunctions.map(fn => fn()));
    } catch (error) {
      // Handle errors
      throw error;
    }
  }
  async compareRetrieveMethods(): Promise<void>{
    const asyncFunctions: (() => Promise<void>)[] = [
      this.getissues.bind(this),
      this.getcontributors.bind(this),
      this.getCommits.bind(this),
      this.getGeneral.bind(this),
      // Add more async functions as needed
    ];
    try {
      const startUsingPromiseAll = performance.now();
      await Promise.all(asyncFunctions.map(fn => fn()));
      const endUsingPromiseAll = performance.now();
      const usingPromiseAllTime = endUsingPromiseAll - startUsingPromiseAll;
      const startUsingTraditionalAwait = performance.now();
      for (const fn of asyncFunctions) {
        await fn();
      }
      const endUsingTraditionalAwait = performance.now();
      const usingTraditionalAwaitTime = endUsingTraditionalAwait - startUsingTraditionalAwait;
      console.log(`Promise.all time: ${usingPromiseAllTime}`)
      console.log(`Traditional time: ${usingTraditionalAwaitTime}`)
    } catch (error) {
      // Handle errors
      throw error;
    }
  }
  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }
  async getissues(): Promise<void>{
    try{
      const response = await this.connection.queryGithubapi('/issues');
      if(response){
        this.issues = response.data
      }
    }
    catch(error) {
      throw error
    }
  }
  async getGeneral(): Promise<void>{
    try {
      const response = await this.connection.queryGithubapi('');
      if (response) {
        // Process and store the license data as needed
      }
    } catch (error) {
      throw error;
    }
  }
  async getCommits(): Promise<void> {
    try {
      const response = await this.connection.queryGithubapi('/commits');
      if (response) {
        // Process and store the commits data as needed
      }
    } catch (error) {
      throw error;
    }
  }
  
  async getcontributors(): Promise<void>{
    try{
      const response = await this.connection.queryGithubapi('/contributors');
      if(response){
        this.contributors = response.data
      }
    }
    catch(error) {
      throw error
    }
  }
  static async create(connection: repoConnection): Promise<repoCommunicator> {
    const instance = new repoCommunicator(connection);
    await instance.waitForInitialization();
    return instance;
  }
}


class metricEvaluation {
  communicator: repoCommunicator;
  issues: any;
  contributors: any;
  commits: any;
  license: any;
  finalscore: any;
  constructor(communicator: repoCommunicator){
    this.communicator = communicator;
  }
  filterIssues(){}
  filterContributors(){}
  filterCommits(){}
  filterlicense(){}
  EvaluateBusFactor(){}
  EvaluateRampUp(){}
  EvaluateCorrectness(){}
  EvaluateLicense(){}
  EvaluateResponsivness(){}
  Evaluatefinalscore(){}
}


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
  

  const startUsingTraditional = performance.now();
  for(var i = 0; i < urls.length; i++){
    const connection: repoConnection = await repoConnection.create(urls[i], token);
    const communicator: repoCommunicator = await repoCommunicator.create(connection);

  }
  const endUsingTraditional = performance.now();
  const usingTraditionalTime = endUsingTraditional-startUsingTraditional;
  console.log(`Traditional time: ${usingTraditionalTime}`)
  
  //await getinfo.compareRetrieveMethods();
  //console.log(getinfo.issues)
}

const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash','https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash','https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash','https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash','https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash','https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];
setupCommunication(urls);