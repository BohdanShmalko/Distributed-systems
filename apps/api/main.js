require('dotenv').config();
const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const { connect, StringCodec } = require('nats');
const { createClient  } = require('redis');

const { getByPeriod } = require('../../libs/database/metrics.model');
const { getCacheKey, subscribes } = require('../../libs/utils')

const { PORT, MONGO_URI, REDIS_URI, NATS_URI, REDIS_TTL } = process.env;

let redisClient;
let nc;
const parser = StringCodec();

// app initialization
const app = express();

// middlewares
app.use(express.json())

// routes

// http://node-01.shmal.store/api/metrics?start=2023-12-20T10:25:06&end=2023-12-20T10:28:43&format=%Y-%m-%dT%H:%M:%S&useCache=true
app.get('/metrics', async (req, res) => {
    try {
        const { start, end, format, useCache } = req.query;
        const inputParams = { 
            startDate: moment(start).toDate(),
            endDate: moment(end).toDate(),
            format, //%Y-%m-%dT%H:%M:%S.%LZ
        };
        const cacheKey = getCacheKey(inputParams);
        
        if(useCache !== 'false') {
            const cachedData = await redisClient.get(cacheKey);
            if(cachedData) {
                res.status(200).send(JSON.stringify({ usedCache: true, data: JSON.parse(cachedData) }));
                return;
            }
        }

        const data = await getByPeriod(inputParams);
        await redisClient.setex(cacheKey, REDIS_TTL ? Number(REDIS_TTL) : 3600, JSON.stringify(data));
        res.status(200).send(JSON.stringify({ usedCache: false, data }));
        
    } catch (error) {
        console.log(error);
    }
});

app.post('/metrics', async (req, res) => {
    try {
        const { time, data } = req.body;
        nc.publish(subscribes.METRICS_SAVE, parser.encode(JSON.stringify({ 
            time,
            data,
        })));
        res.status(201).send('ok')
    } catch (error) {
        console.log(error);
    }
});

(async () => {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to mongo');

    nc = await connect({ servers: [NATS_URI] });
    console.log('Connected to NATS publisher success');
    
    redisClient = await createClient({ url: REDIS_URI })
        .on('error', err => console.log('Redis Client Error', err))
        .connect();
    console.log('Connected to redis');

    app.listen(PORT, async () => {
        console.log(`Server is up and Running at PORT : ${PORT}`)
    })
})()