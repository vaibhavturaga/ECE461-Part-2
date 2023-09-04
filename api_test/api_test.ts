import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' });
const token: string | undefined = process.env.GITHUB_API_KEY;

if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
  }

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
        console.log(endpoint)

        const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
        console.log('Response:', response);
    }
    catch(error){
        console.error('An error occurred:', (error as Error).message);
    }
}

//getPublicRepo();

async function getGithubRepoForNPMurl(url: string): Promise<string | null>{
    const response = await axios.get(url)

    if (response.status !== 200) {
        console.error(`Error: Unable to fetch package information for ${url}`);
        return null;
    }

    const packageInfo = response.data
    console.log(packageInfo)
    if (packageInfo.repository && packageInfo.repository.url) {
        return packageInfo.repository.url;
    }

    return null;
}
const npm = 'https://registry.npmjs.com/lodash'
getGithubRepoForNPMurl(npm).then((githubRepoUrl) => {
  if (githubRepoUrl) {
    const urlParts = githubRepoUrl.split('/');
    console.log(`The GitHub repository for ${npm} is: ${githubRepoUrl}`);
    const org = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1].split('.')[0];
    console.log(org)
    console.log(repo)
    getPublicRepo(repo,org);
  }
  else{
    console.log('repo not found')
  }
})
.catch((error) => {
  console.error(`An error occurred: ${error.message}`);
});