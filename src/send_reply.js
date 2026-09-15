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

const message = `Hi Dr. Camea,

It's so nice to hear from you, hope you and Coach Francis are doing great! We are more than happy to help get your soulsfood.org email up and running.

Because your domain DNS is managed through Cloudflare, Google Workspace is asking for verification before connecting. You can easily get this to us with these quick steps:

1. In your Google Workspace setup window, click "Switch to other verification options" (or "Verify domain with a TXT record").
2. Google will generate a TXT verification code (which usually looks like google-site-verification=...).
3. Copy that TXT code and reply back to this ticket with it, along with any Google MX records shown on screen.

As soon as you send that over, we will add the verification and mail records directly into DNS for you and confirm as soon as it is ready to go!`;

async function main() {
    console.log('Sending reply to ticket 16586...');
    const result = await callWhmcs('AddTicketReply', {
        ticketid: 16586,
        adminusername: 'Brian',
        message: message,
        status: 'Answered'
    });
    console.log('Result:', JSON.stringify(result, null, 2));
}

main();
