const { Schema, model } = require('mongoose');

const MetricsSchema = Schema({
    time: {
        type: Date, 
        required: true, 
    },
    data: { 
        type: Number, 
        required: true, 
    },
}, { timestamps: true });

const metricsModel = model('metrics', MetricsSchema);

const getByPeriod = async ({ startDate, endDate, format }) => {
    const data = await metricsModel.aggregate([
        {
            $match: {
                time: {
                    $gte: startDate,
                    $lte: endDate,
                }
            }
        },
        {
            $project: {
                format: { $dateToString: { format, date: "$time"  } },
                data: 1,
            }
        },
        {
            $group: {
                _id: `$format`,
                result: { $avg: '$data' }
            }
        },
        {
            $project: {
                time: '$_id',
                _id: 0,
                result: 1,
            }
        }
    ]);

    return data;
}

const create = (doc) => {
    return metricsModel.create(doc);
}

module.exports = { getByPeriod, create };