const axios = require('axios');

const baseUrl = 'http://node-01.shmal.store/api/metrics';

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandom = (min, max) => Math.floor(Math.random() * (max - min) + min);

const main = async () => {
    const max = 1000;
    const min = 0;
    while(true) {
        const body = {
            time: Date.now(),
            data: getRandom(min, max),
        };
        await axios.post(baseUrl, body);
        console.log(`Posted ${JSON.stringify(body)}`);
        await timeout(500);
    }
}

main();