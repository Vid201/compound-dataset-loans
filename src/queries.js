export const queryTest = `
query ExampleQuery {
    # this one is coming from compound-v2
    markets(first: 7) {
      borrowRate
      cash
      collateralFactor
    }
  }
`;