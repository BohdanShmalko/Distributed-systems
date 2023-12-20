const getCacheKey = ({ startDate, endDate, format }) => {
    return `${startDate}-${endDate}-${format}`;
}

const subscribes = {
    METRICS_SAVE: 'metricsSave',
}

module.exports = { 
    getCacheKey,
    subscribes,
};