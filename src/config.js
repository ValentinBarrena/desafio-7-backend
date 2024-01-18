import dotenv from 'dotenv';
import { Command } from 'commander';

const commandLineOptions = new Command();
commandLineOptions
    .option('--mode <mode>')
    .option('--port <port>')
commandLineOptions.parse()

// Proximamente defino los dos .env, mientras tanto trabajo con uno solo.
switch (commandLineOptions.opts().mode) {
    case 'prod':
        dotenv.config({ path: './.env'});
        break;
    
    case 'devel':
    default:
        dotenv.config({ path: './.env'});
}

const config = {
    PORT: commandLineOptions.opts().port || 3000,
    MONGOOSE_URL: process.env.MONGOOSE_URL_LOCAL,
    SECRET_KEY: process.env.SECRET_KEY,
    UPLOAD_DIR: 'public/img',
    GITHUB_AUTH: {
        clientId: process.env.GITHUB_AUTH_CLIENT_ID,
        clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET,
        callbackUrl: `http://localhost:${commandLineOptions.opts().port || 3000}/api/auth/githubcallback`
    },
    PERSISTENCE: process.env.PERSISTENCE
};

export default config;