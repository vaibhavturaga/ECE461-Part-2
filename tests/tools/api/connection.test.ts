import * as api from '../../../src/tools/api';

// test('template', () => { TEST CODE HERE });

let globalCommunicaor = api.repoCommunicator; // global communicator to be used in tests
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];


describe('repoConnection', () => {
    test('initialize', async () => {
        
    };
};