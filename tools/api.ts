import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
import { getPackageManifest } from 'query-registry';

dotenv.config({ path: '.env' });
const token: string | undefined = process.env.GITHUB_API_KEY;

if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
  }

/****************************************************************************************************************************************
 * repoConnection
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Request Github Repository. This can be separated into different functions to request for issues, contributors, etc.
 * 5. I am thinking in a different class we can call all of the get issues, getcontributors, etc. So all api calls can be done and then we can just
 * request the class for the JSON formatted information.
 * 
 * TODO:
 * 1. Error handling, can't access github repo, can't access npm package, etc.
 * 2. Specific requests and parsing. (e.g. getissues, getstars, etc.)
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
      try {
        const githubRepoUrl = await this.queryNPM(npm);
        if (githubRepoUrl) {
          console.log(`The GitHub repository for ${npm} is: ${githubRepoUrl}`);
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
}

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
  async getstars(): Promise<void>{

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
}

const npm: string = 'https://www.npmjs.com/package/browserify';
const github: string = 'https://github.com/cloudinary/cloudinary_npm';
(async () => {
  const npmrepo = new repoConnection(npm, token);

  // Wait for the initialization to complete
  await npmrepo.waitForInitialization();

  const getinfo = new repoCommunicator(npmrepo);

  await getinfo.waitForInitialization();
  //await getinfo.compareRetrieveMethods();
  //console.log(getinfo.issues)
})();