import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
        env[key.trim()] = rest.join('=').trim();
    }
});

const apiUrl = env.WHMCS_API_URL;
const apiIdentifier = env.WHMCS_API_IDENTIFIER;
const apiSecret = env.WHMCS_API_SECRET;

async function callWhmcs(action, params = {}) {
    const url = `${apiUrl.replace(/\/$/, '')}/includes/api.php`;
    const postData = {
        identifier: apiIdentifier,
        secret: apiSecret,
        action: action,
        responsetype: 'json',
        ...params
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(postData).toString()
    });

    return await response.json();
}

async function main() {
    console.log('--- Admin Users ---');
    const admins = await callWhmcs('GetAdminUsers', {});
    console.log(JSON.stringify(admins, null, 2));
}

main();
