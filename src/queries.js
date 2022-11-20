export const repayEvents =
    `
query RepayEvents {
    repayEvents(where: { blockNumber_gte: 11571288, blockNumber_lte: 11623430 }, orderBy: blockNumber, orderDirection: asc) {
      id,
      amount
      accountBorrows
      borrower
      blockNumber
      blockTime
      underlyingSymbol
      payer
    }
  }
`
    ;

export const liquidationEvents = ``;

export const getMarketQuery = (blockNumber, underlyingSymbol) => {
    return `
    query {
        markets(block: { number: ${blockNumber}}, where: { underlyingSymbol: "${underlyingSymbol}"}) {
          borrowRate
          cash
          collateralFactor
          exchangeRate
          interestRateModelAddress
          name
          reserves
          supplyRate
          symbol
          id
          totalBorrows
          totalSupply
          underlyingAddress
          underlyingName
          underlyingPrice
          underlyingSymbol
          accrualBlockNumber
          blockTimestamp
          borrowIndex
          reserveFactor
          underlyingPriceUSD
          underlyingDecimals
        }
      }
    `
};
