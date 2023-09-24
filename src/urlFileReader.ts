import * as fsPromise from 'fs/promises';
import logger from '../src/logger';

export const readURLs = async (fileName: string) => {
    const urls: string[] = [];
    await fsPromise.open(fileName, 'r')
        .then(async (response) => {
            for await (const line of response.readLines()){
                urls.push(line);
            }
        })
        .catch(() => {
            logger.error(`File not found at: ${fileName}`)
        });
    return urls;
};

