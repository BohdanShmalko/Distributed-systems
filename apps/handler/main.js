require('dotenv').config();
const { connect, StringCodec } = require('nats');
const mongoose = require('mongoose');
const moment = require('moment');

const { create } = require('../../libs/database/metrics.model');
const { subscribes } = require('../../libs/utils');

const { MONGO_URI, NATS_URI } = process.env;

const main = async () => {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to mongo');

    const nc = await connect({ servers: [NATS_URI] });
    console.log('Connected to NATS subscriber success');

    const subscriptionSaveMetrics = nc.subscribe(subscribes.METRICS_SAVE);
    const parser = StringCodec();

    for await (const message of subscriptionSaveMetrics) {
        try {
            const data = JSON.parse(parser.decode(message.data));
            await create({ time: moment(data.time).toDate(), data: data.data });
        } catch(e) {
            console.log(e);
        }
    }
}

main();