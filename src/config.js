export const THE_GRAPH_API_URL = 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2';
export const COMPOUND_CTOKEN_API_URL = (blockNumber) => { return `https://api.compound.finance/api/v2/ctoken?meta=true&network=mainnet&block_number=${blockNumber}` };
export const CSV_PATH = './data.csv';
export const WAIT_TIME = 1500; // 1.5 seconds