import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
import { getPackageManifest } from 'query-registry';

dotenv.config({ path: '.env' });
const token: string | undefined = process.env.GITHUB_API_KEY;

if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
  }

/*******
 * repoCommunicator
 * 1. takes in url string
 * 2. Parses string to see if it is npmjs
 * 3. If so we talk to the npm with query-register to get the github repository
 * 4. Request Github Repository. This can be separated into different functions to request for issues, contributors, etc.
 * 5. I am thinking in initilization function we can call all of the get issues, getcontributors, etc. So all api calls can be done and then we can just
 * request the class for the JSON formatted information.
 * 
 * TODO:
 * 1. Error handling, can't access github repo, can't access npm package, etc.
 * 2. Specific requests and parsing. (e.g. getissues, getstars, etc.)
 * 3. I think we need to think of a way to minimize requests. We could create a variable to store the JSON of each request e.g. store original request repos/org/repo in a variable
 * store request from repos/org/repo/issues to another variable. etc.
 * 4. Implement a cache? store the repo data to a file and after a certain time clear this file and refill it.
 ******/
class repoCommunicator {
  url: string | null; 
  repo: string;
  org: string; 
  private initializationPromise: Promise<void> | null = null;
  constructor(url: string) {
    this.url = null;
    this.repo = '';
    this.org = '';
    this.initializationPromise = this.initialize(url);
    // Call an asynchronous function and wait for it to complete
  }

  // Intializes class. This finds github url if it is an npm package, and then speerates github repo to organization and repo.
  async initialize(url: string): Promise<void> {
    try {
      const processedUrl = await this.processUrl(url);
      if (processedUrl) {
        const urlParts: string[] = processedUrl.split('/');
        this.org = urlParts[urlParts.length - 2];
        this.repo = urlParts[urlParts.length - 1].split('.')[0];
        this.url = processedUrl;
      } else {
        console.log('Initialization failed: URL not processed.');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      throw error; // Rethrow the error to propagate it to the caller
    }
  }

  //This can be called from other functions when first initializing the class to know when initilization is complete. example code for when intializing instance
  /* 
  (async () => {
  const npmrepo = new repoCommunicator(npm);

  // Wait for the initialization to complete
    await npmrepo.waitForInitialization();

    // Now that the object is initialized, you can call instance methods like getissues
    npmrepo.getissues();
  })();
  
  */
  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      return Promise.resolve();
    }
    return this.initializationPromise;
  }

  /*
  * This Function processes the url to see if it is npm or github.
  *
  * */
  async processUrl(url: string): Promise<string | null> {
    if (url.includes("npmjs")) {
      try {
        const githubRepoUrl = await this.queryNPM(npm);
        if (githubRepoUrl) {
          console.log(`The GitHub repository for ${npm} is: ${githubRepoUrl}`);
          return githubRepoUrl;
        } else {
          console.log('Repository not found');
          return null;
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error occurred: ${error.message}`);
        } else {
          console.error(`An unknown error occurred: ${error}`);
        }
        return null;
      }
    } else {
      return url;
    }
  }

  /**
   * 
   * @param url 
   * 
   * This Function queries npm using getPackageManifest to get the package meta data. Includes info like repository, etc.
   * 
   * @returns response or null
   */
  async queryNPM(url: string): Promise<any>{
    const urlParts: string[] = url.split('/');
    const packageName: string = urlParts[urlParts.length - 1].split('.')[0];
    const packageInfo = await getPackageManifest({ name: packageName });

    if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
      return packageInfo.gitRepository.url;
    }
    return null;
  }
  /**
   * 
   * @param queryendpoint 
   * @returns response
   * 
   *  This Function queries the GitHub API. It takes argument queryendpoint, this is to create a more specific api request.
   * Will have to look most of these up but you can get information about issues and their status by using endpoint issues, can get commits info, contributors, etc.
   */
  async queryGithubapi(queryendpoint: string): Promise<AxiosResponse<any[]> | null>{
    try{
      const axiosInstance = axios.create({
          baseURL: 'https://api.github.com/',
          headers:{
              Authorization: `token ${token}`,
              Accept: 'application/json'
          },
      });
      console.log(this.org)
      console.log(this.repo)
      const endpoint: string = `repos/${this.org}/${this.repo}${queryendpoint}`

      const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
      console.log(response)
      return response;
    }
    catch(error){
        console.error('An error occurred Github api:', (error as Error).message);
    }
    return null;
  }

  /**
   * The Functions below will take care of more specific api queries. getissues will call @queryGithubapi 
   * with /issues and then store the information in this class.
   */
  getissues(){
    this.queryGithubapi('/issues')
      .then((response)=>{
        console.log(response)
      })
      .catch((error) => {
        console.error('Error getting issues', error);
      });
  }
  getstars(){

  }
  getcontributors(){

  }
}


const npm: string = 'https://www.npmjs.com/package/browserify';
const github: string = 'https://github.com/cloudinary/cloudinary_npm';
(async () => {
  const npmrepo = new repoCommunicator(npm);

  // Wait for the initialization to complete
  await npmrepo.waitForInitialization();

  // Now that the object is initialized, you can call instance methods like getissues
  npmrepo.getissues();
})();