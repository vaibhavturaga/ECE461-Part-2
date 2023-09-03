import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' });
const token: string | undefined = process.env.GITHUB_API_KEY;

if (!token) {
    console.error('GitHub API token not found in the .env file');
    process.exit(1); // Exit the script with an error code
  }

async function getPublicRepo(): Promise<void> {
    try{
        const axiosInstance = axios.create({
            baseURL: 'https://api.github.com/',
            headers:{
                Authorization: `token ${token}`,
                Accept: 'application/json'
            },
        });
        const endpoint: string = 'repos/apache/airflow'

        const response: AxiosResponse<any[]> = await axiosInstance.get(endpoint);
        console.log('Response:', response);
    }
    catch(error){
        console.error('An error occurred:', (error as Error).message);
    }
}

getPublicRepo();