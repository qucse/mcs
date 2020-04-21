const configurations = {
    port: 1504,
    cmc_api : 'http://127.0.0.1:5050/api/v1/CMC',
    map_matching_api : 'http://127.0.0.1:8989/match?vehicle=car&traversal_keys=true&',
    route_matching_api : 'http://127.0.0.1:5000/api/v1/match'
};
module.exports = configurations;