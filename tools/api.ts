import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
import { getPackageManifest } from 'query-registry';

dotenv.config({ path: '.env' });
const token: string | undefined = process.env.GITHUB_API_KEY;

if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
  }

/*
  async function getPublicRepo(repo: string, org: string): Promise<void> {
    try{
        const axiosInstance = axios.create({
            baseURL: 'https://api.github.com/',
            headers:{
                Authorization: `token ${token}`,
                Accept: 'application/json'
            },
        });
        const endpoint: string = `repos/${org}/${repo}`

        const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
    }
    catch(error){
        console.error('An error occurred:', (error as Error).message);
    }
}


async function getGithubRepoForNPMurl(url: string): Promise<string | null>{
    /*
    const response = await axios.get(url);
    //const response = await fetchJson(url);
    
    if (response.status !== 200) {
        console.error(`Error: Unable to fetch package information for ${url}`);
        return null;
    }

    const packageInfo = response.data;
    //console.log(packageInfo)
    //console.log(packageInfo.repository)
    if (packageInfo.repository && packageInfo.repository.url) {
        return packageInfo.repository.url;
    }
    *//*
    const urlParts: string[] = url.split('/');
    const packageName: string = urlParts[urlParts.length - 1].split('.')[0];
    const packageInfo = await getPackageManifest({ name: packageName });

    if (packageInfo.gitRepository && packageInfo.gitRepository.url) {
      return packageInfo.gitRepository.url;
    }
    return null;
}

function processUrl(url:string): void{
  if(url.includes("npmjs")){
    getGithubRepoForNPMurl(npm).then((githubRepoUrl) => {
      if (githubRepoUrl) {
        const urlParts: string[] = githubRepoUrl.split('/');
        const org: string = urlParts[urlParts.length - 2];
        const repo: string = urlParts[urlParts.length - 1].split('.')[0];
        console.log(`The GitHub repository for ${npm} is: ${githubRepoUrl}`);
        getPublicRepo(repo,org);
      }
      else{
        console.log('repo not found')
      }
    })
    .catch((error) => {
      console.error(`An error occurred: ${error.message}`);
    });
  }
  else if(url.includes("github")){
    const urlParts: string[] = url.split('/');
    const org: string = urlParts[urlParts.length - 2];
    const repo: string = urlParts[urlParts.length - 1].split('.')[0];
    getPublicRepo(repo,org);
  }
} 
*/
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
              Authorization: `token ${token}`,
              Accept: 'application/json'
          },
      });
      console.log(this.org)
      console.log(this.repo)
      const endpoint: string = `repos/${this.org}/${this.repo}`

      const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
      console.log(response)
      return response;
    }
    catch(error){
        console.error('An error occurred Github api:', (error as Error).message);
    }
    return null;
  }
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
  const npmrepo = new repoCommunicator(github);

  // Wait for the initialization to complete
  await npmrepo.waitForInitialization();

  // Now that the object is initialized, you can call instance methods like getissues
  npmrepo.getissues();
})();