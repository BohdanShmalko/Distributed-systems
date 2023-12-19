const getCacheKey = ({ startDate, endDate, format }) => {
    return `${startDate}-${endDate}-${format}`;
}

module.exports = { getCacheKey };