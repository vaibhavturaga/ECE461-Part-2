import * as fsPromise from 'fs/promises'; 

export const readEnv = async () => {
    let token: string | undefined = "";
    let logLevel: string | undefined = "";
    let logFile: string | undefined = "";
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env' });
    token = process.env.GITHUB_TOKEN;
    logLevel = process.env.LOG_LEVEL;
    logFile = process.env.LOG_FILE;
    /*
    await fsPromise.open("./.env", 'r')
        .then(async (response) => {
            for await (const line of response.readLines()){
                if(line.includes("GITHUB_TOKEN=")){
                    token = line.replace("GITHUB_TOKEN=", "");
                }
                else if(line.includes("LOG_LEVEL=")){
                    logLevel = line.replace("LOG_LEVEL=", "");
                }
                else if(line.includes("LOG_FILE=")){
                    logFile = line.replace("LOG_FILE=", "");
                }
            }
        })
        .catch(() => {
            console.error(`.env file not found`)
            process.exit(1);
        });
        */
    return {token:token, logLevel:logLevel, logFile:logFile};
};

/*export const testEnv = async () => {
    var env = await readEnv();
    console.log(env);
}
testEnv();*/
