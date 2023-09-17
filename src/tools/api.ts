import axios, {AxiosResponse} from 'axios';
import { getPackageManifest } from 'query-registry';
import logger from '../logger';

/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Request Github Repository. This can be separated into different functions to request for issues, contributors, etc.
 * 
 * TODO:
 * 1. can't access github repo, can't access npm package, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 * 
 * Completed:
 * 1. error handling, imported logger and swapped any console writes with logger calls
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
export class repoConnection{
  url: string | null;
  urlFromFile: string | null = null; 
  githubkey: string | null;
  repo: string;
  org: string;
  private initializationPromise: Promise<void> | null = null;
  
  constructor(url: string, githubkey: string) {
    this.urlFromFile = url;
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
        throw logger.error('Initialization failed: Github URL not Found.');
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
      try {
        const githubRepoUrl = await this.queryNPM(url);
        if (githubRepoUrl) {
          //logger.info(`The GitHub repository for ${url} is: ${githubRepoUrl}`);
          return githubRepoUrl;
        } else {
          return null;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw logger.error(`An unknown error occurred: ${error}`)
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
      const endpoint: string = `repos/${this.org}/${this.repo}${queryendpoint}`;
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
 * 2. 203 error, could also hand it in the github api function
 **************************************************************************************************************************************/
export class repoCommunicator {
  connection: repoConnection;
  private initializationPromise: Promise<void> | null = null;
  contributors: any[] | null = null;
  commits: any[] | null = null;
  OpenIssues: number | null = null;
  closedIssues: number | null = null;
  general: any[] | null = null;
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
      logger.info(`Promise.all time: ${usingPromiseAllTime}`)
      logger.info(`Traditional time: ${usingTraditionalAwaitTime}`)
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
      const openIssuesResponse = await this.connection.queryGithubapi('/issues?state=open');
      const closedIssuesResponse = await this.connection.queryGithubapi('/issues?state=closed');
      if(openIssuesResponse){this.OpenIssues = openIssuesResponse.data.length;}
      if(closedIssuesResponse){this.closedIssues = closedIssuesResponse.data.length;}
    }
    catch(error) {
      throw error
    }
  }

  async getGeneral(): Promise<void>{
    try {
      const response = await this.connection.queryGithubapi('');
      if (response) {
        this.general = response.data
      }
    } catch (error) {
      throw error;
    }
  }

  async getCommits(): Promise<void> {
    try {
      const response = await this.connection.queryGithubapi('/commits');
      if (response) {
        this.commits = response.data;
      }
    } catch (error) {
      throw error;
    }
  }
  
  async getcontributors(): Promise<void>{
    try{
      const response = await this.connection.queryGithubapi('/stats/contributors');
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

/**
 * metricEvaluation
 * 1. takes in the communicator
 * 2. filters through responses that are stored in communicator to generate metric calculations
 * 
 * TODO:
 * 1. Error handling, can't find metric
 */
export class metricEvaluation {
  communicator: repoCommunicator;
  license: number = 0;
  threshold_response: number = 3;
  threshold_bus: number = 5;
  finalscore: any;
  busFactor: number = 0;
  responsivness: number = 0;
  constructor(communicator: repoCommunicator){
    this.communicator = communicator;
  }

  filterIssues(){
    let completedCount: number = 0;
    let inProgressCount: number  = 0;
    let toDoCount: number  = 0;
    if(this.communicator.closedIssues) {
      logger.info(this.communicator.closedIssues.toString())
    }
  }

  getBus(){
    if(Array.isArray(this.communicator.contributors)){
      let commitList: number[] = [];
      this.communicator.contributors.forEach(contributor => {
        commitList.push(contributor.total)
    });
    const sortedCommits = commitList.sort((a, b) => b - a);
    const sum = sortedCommits.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let current_sum = 0
    for(let i = 0; i < sortedCommits.length && current_sum < sum/2; i++){
        current_sum += sortedCommits[i];
        this.busFactor += 1
    }
    this.busFactor = Math.min(1, this.busFactor/this.threshold_bus)
    logger.info(`Bus ${this.busFactor}`)
    }
  }

  getResponsiveness(){
    if(this.communicator.commits){
      const mostRecentCommit = this.communicator.commits[0];
      const commitDate = new Date(mostRecentCommit.commit.author.date);
      const today = new Date();
      const diffInMonths = (today.getFullYear() - commitDate.getFullYear()) * 12 + (today.getMonth() - commitDate.getMonth());
      this.responsivness = this.threshold_response / Math.max(this.threshold_response, diffInMonths)
      logger.info(`responsiveness: ${this.responsivness}`)
    }
  }

  getlicense(){
    if(this.communicator.general){
      if('license' in this.communicator.general){
        if(this.communicator.general.license){
          this.license = 1
        }
      }
      logger.info(`license: ${this.license}`)
    }
  }
}