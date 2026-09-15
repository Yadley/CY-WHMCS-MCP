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
const accessKey = env.WHMCS_ACCESS_KEY;

async function callWhmcs(action, params = {}) {
    const url = `${apiUrl.replace(/\/$/, '')}/includes/api.php`;
    const postData = {
        identifier: apiIdentifier,
        secret: apiSecret,
        action: action,
        responsetype: 'json',
        ...params
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
    const ticketId = 16586;
    console.log(`Checking existing replies for ticket ${ticketId}...`);
    try {
        const ticketInfo = await callWhmcs('GetTicket', { ticketid: ticketId });
        const existingReplies = ticketInfo?.replies?.reply || [];
        const normalizedMessage = message.trim().replace(/\r\n/g, '\n');
        
        const isDuplicate = existingReplies.some(r => {
            const existingText = (r.message || '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/\r\n/g, '\n').trim();
            return existingText.includes('Because your domain DNS is managed through Cloudflare') || existingText === normalizedMessage;
        });

        if (isDuplicate) {
            console.log(`Matching reply already exists on ticket ${ticketId}. Skipping duplicate submission.`);
            return;
        }

        console.log(`Sending reply to ticket ${ticketId}...`);
        const result = await callWhmcs('AddTicketReply', {
            ticketid: ticketId,
            adminusername: 'Brian',
            message: message,
            status: 'Answered'
        });
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.result !== 'success') {
            console.error('Failed to post reply:', result.message || 'Unknown error');
            process.exitCode = 1;
        }
    } catch (err) {
        console.error('Error during reply execution:', err);
        process.exitCode = 1;
    }
}

main();
