import * as fsPromise from 'fs/promises';

export const readURLs = async (fileName: string) => {
    const urls: string[] = [];
    await fsPromise.open(fileName, 'r')
        .then(async (response) => {
            for await (const line of response.readLines()){
                urls.push(line);
            }
        })
        .catch(() => {
            console.error(`File not found at: ${fileName}`)
        });
    return urls;
};

