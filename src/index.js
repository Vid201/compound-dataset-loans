import fetch from 'node-fetch';
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

import { createClient } from 'urql';
import { THE_GRAPH_API_URL, COMPOUND_CTOKEN_API_URL, CSV_PATH, WAIT_TIME } from './config.js';
import { repayEventsQuery, liquidationEventsQuery, borrowEventsQuery, marketsQuery } from './queries.js';
import { filterCTokens } from './utils.js';
import * as fs from 'fs';
import moment from 'moment';

const start_block_number_repay = process.argv[2];
const end_block_number_repay = process.argv[3];
const start_block_number_liquidation = process.argv[4];
const end_block_number_liquidation = process.argv[5];

const client = createClient({
    url: THE_GRAPH_API_URL,
});

const dataFields = [
    'Event',
    'Start date',
    'Amount Paid',
    'Amount Paid (USD)',
    'Amount Paid (ETH)',
    // Cumulative APY
    'End date',
    'Name',
    'Symbol',
    'Price (USD)',
    'Price (ETH)',
    'Supply APY',
    'Borrow APY',
    'Total Supply',
    'Total Borrow',
    'Market Liquidity',
    '# of Suppliers',
    '# of Borrowers',
    'ETH Borrow Cap',
    'Reserves',
    'Reserve Factor',
    'Collateral Factor',
    'cToken Minted',
    'Exchange Rate',
];
fs.writeFileSync(CSV_PATH, dataFields.join(',') + '\n', 'utf-8', (_) => { });

let start_block_numbers = [start_block_number_repay, start_block_number_liquidation];
const end_block_numbers = [end_block_number_repay, end_block_number_liquidation];

while (true) {
    await new Promise(r => setTimeout(r, WAIT_TIME));
    const repayEvents = await client.query(repayEventsQuery(start_block_numbers[0], end_block_numbers[0])).toPromise();

    if (typeof repayEvents.data === 'undefined' || repayEvents.data === null) {
        console.log(`repayEvents error`);
        continue;
    }

    await new Promise(r => setTimeout(r, WAIT_TIME));
    const liquidationEvents = await client.query(liquidationEventsQuery(start_block_numbers[1], end_block_numbers[1])).toPromise();

    if (typeof liquidationEvents.data === 'undefined' || liquidationEvents.data === null) {
        console.log(`liquidationEvents error`);
        continue;
    }

    const eventTypes = ['repayEvents', 'liquidationEvents'];
    const events = [repayEvents, liquidationEvents];
    const eventNames = ['Repay', 'Liquidation'];

    for (let e = 0; e < eventTypes.length; e++) {
        for (let i = 0; i < events[e].data[eventTypes[e]].length; i++) {
            await new Promise(r => setTimeout(r, WAIT_TIME));

            const event = events[e].data[eventTypes[e]][i];

            let data;
            try {
                const res = await fetch(COMPOUND_CTOKEN_API_URL(event.blockNumber));

                if (res.status === 500) {
                    continue;
                }

                data = await res.json();
            } catch (error) {
                console.log(`${e}:${i}/${events[e].data[eventTypes[e]].length}: error`);
                i -= 1;
                continue;
            }

            if (typeof data.errors !== 'undefined' && data.errors !== null) {
                console.log(`${e}:${i}/${events[e].data[eventTypes[e]].length}: error`);
                i -= 1;
                continue;
            }

            const cTokens = data.cToken;

            const cToken = filterCTokens(cTokens, event.underlyingSymbol);

            const marketPromise = await client.query(marketsQuery(event.blockNumber, event.underlyingSymbol)).toPromise();

            if (typeof marketPromise.data === 'undefined' || marketPromise.data === null) {
                console.log(`${e}:${i}/${events[e].data[eventTypes[e]].length}: error`);
                i -= 1;
                continue;
            }

            const market = marketPromise.data.markets[0];

            const priceCoinInUSD = market.underlyingPriceUSD;
            const priceCoinInETH = cToken['underlying_price'].value;

            const borrowEventsPromise = await client.query(borrowEventsQuery(Object.hasOwn(event, 'borrower') ? event.borrower : event.from, event.underlyingSymbol, event.blockNumber)).toPromise();

            if (typeof borrowEventsPromise.data === 'undefined' || borrowEventsPromise.data === null) {
                console.log(`${e}:${i}/${events[e].data[eventTypes[e]].length}: error`);
                i -= 1;
                continue;
            }

            const borrows = borrowEventsPromise.data.borrowEvents;

            let startDate;
            let amountCounter = 0;

            for (let j = 0; j < borrows.length; j++) {
                const borrowEvent = borrows[j];
                amountCounter += parseInt(borrowEvent.amount);
                if (amountCounter >= event.amount || j === borrows.length - 1) {
                    startDate = borrowEvent.blockTime;
                }
            }

            let values = [
                eventNames[e],
                moment.unix(startDate).format('DD/MM/YYYY'),
                event.amount,
                event.amount * priceCoinInUSD,
                event.amount * priceCoinInETH,
                moment.unix(event.blockTime).format('DD/MM/YYYY'),
                market.underlyingName,
                event.underlyingSymbol,
                priceCoinInUSD,
                priceCoinInETH,
                cToken['supply_rate'].value,
                cToken['borrow_rate'].value,
                cToken['total_supply'].value,
                cToken['total_borrows'].value,
                cToken['cash'].value,
                cToken['number_of_suppliers'],
                cToken['number_of_borrowers'],
                cToken['borrow_cap'].value,
                cToken['reserves'].value,
                cToken['reserve_factor'].value,
                cToken['collateral_factor'].value,
                cToken['total_supply'].value,
                1 / cToken['exchange_rate'].value,
            ]

            fs.appendFileSync(CSV_PATH, values.join(',') + '\n', 'utf-8', (_) => { });
        }
    }

    let counter = 0;

    for (let e = 0; e < eventTypes.length; e++) {
        counter += events[e].data[eventTypes[e]].length;

        if (events[e].data[eventTypes[e]].length > 0) {
            start_block_numbers[e] = events[e].data[eventTypes[e]][events[e].data[eventTypes[e]].length - 1].blockNumber + 1;
        }
    }

    if (counter === 0) {
        break;
    }
}