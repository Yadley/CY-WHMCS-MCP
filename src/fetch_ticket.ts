import 'dotenv/config';
import { WhmcsApiClient } from './whmcs-client.js';

const config = {
    apiUrl: process.env.WHMCS_API_URL || '',
    apiIdentifier: process.env.WHMCS_API_IDENTIFIER || '',
    apiSecret: process.env.WHMCS_API_SECRET || '',
    accessKey: process.env.WHMCS_ACCESS_KEY,
};

const client = new WhmcsApiClient(config);

async function main() {
    try {
        console.log('Fetching ticket 16586...');
        const ticket = await client.getTicket({ ticketid: 16586 });
        console.log('--- Ticket Data ---');
        console.log(JSON.stringify(ticket, null, 2));
    } catch (err) {
        console.error('Error fetching ticket:', err);
        process.exit(1);
    }
}

main();
