import EthDater from 'ethereum-block-by-date';
import { ethers } from 'ethers';
const provider = new ethers.providers.CloudflareProvider();

const dater = new EthDater(
    provider
);
const date = process.argv[2];

const block = await dater.getDate(date, true, false);

console.log(`block number: ${block.block}`);
