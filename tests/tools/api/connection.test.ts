import * as api from '../../../src/tools/api';

let globalCommunicaor = api.repoCommunicator; // global communicator to be used in tests
const urls: string[] = ['https://www.npmjs.com/package/browserify', 'https://github.com/cloudinary/cloudinary_npm', 'https://www.npmjs.com/package/express', 'https://github.com/nullivex/nodist', 'https://github.com/lodash/lodash'];


describe.skip('repoConnection', () => {
    test('initialize', async () => {
        test.todo('make tests');
    });
});