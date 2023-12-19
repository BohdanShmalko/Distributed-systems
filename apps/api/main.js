require('dotenv').config();
const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');

const { getByPeriod } = require('../../libs/database/metrics.model');
const { getCacheKey } = require('../../libs/utils')

const { PORT, MONGO_URI, REDIS_URI, NATS_URI } = process.env;

const cache = {};

// app initialization
const app = express();

// middlewares
app.use(express.json())

// routes

// http://localhost:9091/metrics?start=2023-09-17&end=2023-10-18&format=%Y-%m-%dT%H:%M:%S&useCache=true
app.get('/metrics', async (req, res) => {
    try {
        const { start, end, format, useCache } = req.query;
        const inputParams = { 
            startDate: moment(start).toDate(),
            endDate: moment(end).toDate(),
            format, //%Y-%m-%dT%H:%M:%S.%LZ
        };
        const cacheKey = getCacheKey(inputParams);
        let usedCache = false;
        let data;
        if(cacheKey in cache && useCache !== 'false') {
            usedCache = true;
            data = cache[cacheKey];
        } else {
            const rawData = await getByPeriod(inputParams);
            data = JSON.stringify(rawData);
            if(useCache !== 'false') {
                cache[cacheKey] = data;
            }
        }
        res.status(200).send(JSON.stringify({ usedCache, data }));
    } catch (error) {
        console.log(error);
    }
});

app.post('/metrics', async (req, res) => {
    try {
        const body = req.body;
        // set to nats
        res.status(201).send('ok')
    } catch (error) {
        console.log(error);
    }
});

(async () => {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to mongo');
    // await mongoose.connect(MONGO_URI);
    // console.log('Connected to nats');
    // await mongoose.connect(MONGO_URI);
    // console.log('Connected to redis');
    app.listen(PORT, async () => {
        console.log(`Server is up and Running at PORT : ${PORT}`)
    })
})()