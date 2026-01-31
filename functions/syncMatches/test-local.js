
// Mock environment variables
process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'https://cloud.appwrite.io/v1';
process.env.APPWRITE_FUNCTION_PROJECT_ID = 'TEST_PROJECT_ID';
process.env.APPWRITE_API_KEY = 'TEST_API_KEY';
process.env.THESPORTSDB_LEAGUE_ID = '4380'; // NHL
process.env.THESPORTSDB_API_KEY = '2'; // Free key

async function run() {
    console.log('Running test-local.js...');

    // Mock the Appwrite SDK and Axios locally if needed,
    // but better to just try to import the main function and run it 
    // IF we have the dependencies installed. 
    // Since we are in the user's environment, we might not have `node-appwrite` installed in the root or in the function folder yet.

    // For this test script to work effectively without installing dependencies in the user's root, 
    // we would need to cd into functions/syncMatches and run npm install.
    // However, we can also just inspect the code logic via "dry run" or assume correctness if the user is expected to deploy.

    // But to truly verify, let's try to run it.

    try {
        const main = await import('./main.js');

        const req = {
            headers: {}
        };

        const res = {
            json: (data, code = 200) => {
                console.log('Response Code:', code);
                console.log('Response Data:', JSON.stringify(data, null, 2));
            }
        };

        const log = (msg) => console.log('[LOG]:', msg);
        const error = (msg) => console.error('[ERROR]:', msg);

        // NOTE: This will fail if node-appwrite is not installed.
        // We will notify the user to install dependencies if they want to run this locally.
        await main.default({ req, res, log, error });

    } catch (err) {
        console.error('Test execution failed:', err);
    }
}

run();
