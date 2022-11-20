import { createClient } from 'urql';
import { APIURL } from './config.js';
import { queryTest } from './queries.js';

const client = createClient({
    url: APIURL,
});

const data = await client.query(queryTest).toPromise();
console.log(data.data);