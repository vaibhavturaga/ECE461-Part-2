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
 * 1. better error handling: can't access github repo, can't access npm package, etc.
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 * 
 * Completed:
 * 1. imported logger and swapped any console writes with logger calls
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
  error_occurred: boolean = false;
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
        logger.error('Initialization failed: Github URL not Found.');
        this.error_occurred = true;
      }
    } catch (error) {
      logger.error(`${error}`); // Rethrow the error to propagate it to the caller
      this.error_occurred = true;
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
          logger.error(`${error}`); // Rethrow the error to propagate it to the caller
        } else {
          logger.error(`An unknown error occurred: ${error}`)
        }
        this.error_occurred = true;
        return null;
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

  // ex goal: https://api.github.com/repos/browserify/browserify
  // ex endpoint: '/commits', '', '/issues?state=closed', '/issues?state=open'
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
      logger.error(`${error}`);
      this.error_occurred = true;
     // process.exit(1);
      return null;
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
    if(!this.connection.error_occurred){
      this.initializationPromise = this.retrieveAllInfo();
    }
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
      logger.error(`${error}`);
      process.exit(1);
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
      logger.error(`${error}`);
    }
  }

  async getGeneral(): Promise<void>{
    try {
      const response = await this.connection.queryGithubapi('');
      if (response) {
        this.general = response.data
      }
    } catch (error) {
      logger.error(`${error}`);
    }
  }

  async getCommits(): Promise<void> {
    try {
      const response = await this.connection.queryGithubapi('/commits');
      if (response) {
        this.commits = response.data;
      }
    } catch (error) {
      logger.error(`${error}`);
    }
  }
  
  async getcontributors(): Promise<void>{
    try{
      const response = await this.connection.queryGithubapi('/stats/contributors');
      if(response){
        this.contributors = response.data
        //console.log(response.data)
      }
    }
    catch(error) {
      logger.error(`${error}`);
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
  threshold_rampup: number = 8;
  busFactor: number = 0;
  responsivness: number = 0;
  rampUp: number = 0;
  correctness: number = 0;
  score: number = 0;
  constructor(communicator: repoCommunicator){
    this.communicator = communicator;
    this.getBus();
    this.getRampUp();
    this.getCorrectness();
    this.getResponsiveness()
    this.getlicense();
    this.netScore();
  }

  getCorrectness(){
    if(!this.communicator.general){
      return;
    }
    if('open_issues_count' in this.communicator.general && 'watchers_count' in this.communicator.general){
      const open_issues: any = this.communicator.general.open_issues_count;
      const watchers_count: any = this.communicator.general.watchers_count;
      this.correctness = Math.max(1 - Math.log(open_issues) / Math.log(watchers_count), 0)
    }
  }
  getRampUp(){
    if(!this.communicator.contributors || !Array.isArray(this.communicator.contributors)){
      console.log(this.communicator.contributors)
      return;
    }
    //console.log(this.communicator.contributors)
    const firstCommitWeeks = this.communicator.contributors.map(contributor => {
      for (const week of contributor.weeks) {
        if (week.c > 0) {
          return week.w;
        }
      }
      return null;
    }).filter(Boolean);
    if(firstCommitWeeks.length === 0){
      return null;
    }
    const sortedWeeks = firstCommitWeeks.slice().sort((a, b) => a - b);
    let differences = []
    for (let i = 1; i < sortedWeeks.length; i++) {
      const diff = sortedWeeks[i] - sortedWeeks[i - 1];
      differences.push(diff);
    }
  
    const average_seconds =  differences.reduce((acc, diff) => acc + diff, 0) / differences.length;
    const average_weeks = average_seconds / 60 / 60 / 24 / 7
    this.rampUp = average_weeks? Math.min(1, this.threshold_rampup/average_weeks): 0;
    //logger.info(`Ramp Up: ${this.rampUp}`)
  }
  getBus(){
    if(!this.communicator.contributors){
      return;
    }
    if(Array.isArray(this.communicator.contributors)){
      let commitList: number[] = [];
      this.communicator.contributors.forEach(contributor => {
        commitList.push(contributor.total)
    });
    //console.log(commitList)
    const sortedCommits = commitList.sort((a, b) => b - a);
    const sum = sortedCommits.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let current_sum = 0
    for(let i = 0; i < sortedCommits.length && current_sum < sum/2; i++){
        current_sum += sortedCommits[i];
        this.busFactor += 1
    }
    this.busFactor = Math.min(1, this.busFactor/this.threshold_bus)
   // logger.info(`Bus Factor: ${this.busFactor}`)
    }
  }

  getResponsiveness(){
    if(this.communicator.commits){
      const mostRecentCommit = this.communicator.commits[0];
      const commitDate = new Date(mostRecentCommit.commit.author.date);
      const today = new Date();
      const diffInMonths = (today.getFullYear() - commitDate.getFullYear()) * 12 + (today.getMonth() - commitDate.getMonth());
      this.responsivness = this.threshold_response / Math.max(this.threshold_response, diffInMonths)
    //  logger.info(`Responsivene Maintainer: ${this.responsivness}`)
    }
  }

  getlicense(){
    if(this.communicator.general){
      if('license' in this.communicator.general){
        if(this.communicator.general.license){
          this.license = 1
        }
      }
    //  logger.info(`License: ${this.license}`)
    }
  }

  netScore(){
    this.score = 0.2 * this.busFactor + 0.3 * this.responsivness + 0.1 * this.license + 0.1 * this.rampUp + 0.3 * this.correctness;
   // logger.info(`Net Score: ${this.score}`)
    return this.score;
  }
  logAll(){
    logger.info(`Bus Factor: ${this.busFactor}`)
    logger.info(`Ramp Up: ${this.rampUp}`)
    logger.info(`Correctness: ${this.correctness}`)
    logger.info(`Responsivene Maintainer: ${this.responsivness}`)
    logger.info(`License: ${this.license}`)
    logger.info(`Net Score: ${this.score}`)
  }
}