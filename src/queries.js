export const repayEventsQuery = (start_block_number, end_block_number) => {
    return `
query {
    repayEvents(where: { blockNumber_gte: ${start_block_number}, blockNumber_lte: ${end_block_number} }, orderBy: blockNumber, orderDirection: asc) {
      amount
      borrower
      blockNumber
      blockTime
      underlyingSymbol
    }
  }
` }
    ;

export const liquidationEventsQuery = (start_block_number, end_block_number) => {
    return `
query {
    liquidationEvents(where: { blockNumber_gte: ${start_block_number}, blockNumber_lte: ${end_block_number} }, orderBy: blockNumber, orderDirection: asc) {
      amount
      from
      blockNumber
      blockTime
      underlyingSymbol
    }
  }
` }
    ;

export const borrowEventsQuery = (borrower, underlyingSymbol, blockNumber) => {
    return `
query {
    borrowEvents(where: { borrower: "${borrower}", underlyingSymbol: "${underlyingSymbol}", blockNumber_lte: ${blockNumber} }, orderBy: blockNumber, orderDirection: desc) {
      amount
      accountBorrows
      blockTime
    }
  }

` };

export const marketsQuery = (blockNumber, underlyingSymbol) => {
    return `
    query {
        markets(block: { number: ${blockNumber}}, where: { underlyingSymbol: "${underlyingSymbol}"}) {
          underlyingName
          underlyingPriceUSD
        }
      }
    `
};
