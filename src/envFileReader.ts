import * as fsPromise from 'fs/promises'; 

export const readEnv = async () => {
    let token = "";
    let logLevel = "";
    let logFile = "";
    
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
        });

    return {token:token, logLevel:logLevel, logFile:logFile};
};

/*export const testEnv = async () => {
    var env = await readEnv();
    console.log(env);
}
testEnv();*/
