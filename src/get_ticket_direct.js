import fs from 'fs';

// Read .env manually
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
        env[key.trim()] = rest.join('=').trim();
    }
});

const apiUrl = env.WHMCS_API_URL;
if (!apiUrl) {
    console.error('Configuration error: WHMCS_API_URL is required in .env');
    process.exit(1);
}
const apiIdentifier = env.WHMCS_API_IDENTIFIER;
const apiSecret = env.WHMCS_API_SECRET;
const accessKey = env.WHMCS_ACCESS_KEY;

console.log('Using API URL:', apiUrl);

async function getTicket(ticketid) {
    const url = `${apiUrl.replace(/\/$/, '')}/includes/api.php`;
    const postData = {
        identifier: apiIdentifier,
        secret: apiSecret,
        action: 'GetTicket',
        ticketid: ticketid.toString(),
        responsetype: 'json'
    };

    if (accessKey) {
        postData.accesskey = accessKey;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(postData).toString()
    });

    const data = await response.json();
    return data;
}

async function main() {
    try {
        const ticketData = await getTicket(16586);
        console.log('=== TICKET RESULT ===');
        console.log(JSON.stringify(ticketData, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
