import axios from "axios";
import { createClient } from 'urql';
import { THE_GRAPH_API_URL, COMPOUND_API_URL, CSV_PATH } from './config.js';
import { repayEvents, getMarketQuery } from './queries.js';
import { filterCTokens } from './utils.js';
import * as fs from 'fs';
import moment from 'moment';

const client = createClient({
    url: THE_GRAPH_API_URL,
});

const dataFields = [
    'Event',
    'Amount Paid',
    'Amount Paid (USD)',
    'Amount Paid (ETH)',
    'End date',
    'Name',
    'Symbol',
    'Price (USD)',
    'Price (ETH)',
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

// query all repay events

const data = await client.query(repayEvents).toPromise();

for (let i = 0; i < data.data.repayEvents.length; i++) {
    const event = data.data.repayEvents[i];
    // console.log(event);

    const res = await axios.get(COMPOUND_API_URL(event.blockNumber));
    const cTokens = res.data.cToken;

    const cToken = filterCTokens(cTokens, event.underlyingSymbol);
    // console.log(cToken);

    const marketPromise = await client.query(getMarketQuery(event.blockNumber, event.underlyingSymbol)).toPromise();
    const market = marketPromise.data.markets[0];
    // console.log(market);

    const priceCoinInUSD = market.underlyingPriceUSD;
    const priceCoinInETH = cToken['underlying_price'].value;

    let values = [
        'Repay',
        event.amount,
        event.amount * priceCoinInUSD,
        event.amount * priceCoinInETH,
        moment.unix(event.blockTime).format('DD/MM/YYYY'),
        market.underlyingName,
        event.underlyingSymbol,
        priceCoinInUSD,
        priceCoinInETH,
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
};

// query all liquidation events
