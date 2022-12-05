# compound-loans-dataset

This repo contains scripts for creating the loans dataset for Compound Finance. The script retrieves all Repay and Liquidation events (and associated metadata) in the given time range.

Check `data.csv` to see what the dataset looks like.

## How to run?

Install packages:

```bash
yarn install
```

Convert date to block number (repeat for start date and end date):

```bash
yarn run get-block-date 01/01/2020
```

Start fetching the data (enter start and end block number retrieved in the previous step):

```bash
yarn start 9193042 10966307 9193042 10966307
```