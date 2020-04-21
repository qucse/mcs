const mongoose = require('mongoose');

const ClusterSchema = mongoose.Schema({
    passengers: [Number],
    shapeId: {
        type: Number,
        default: -1
    },
    routeId: {
        type: Number,
        default: -1
    },
    history: [[Number, Number]],
    deviationCounter : {
        type : Number,
        default : 0
    },
    lastUpdated: Date
});

const clusterSchema = mongoose.model('clustersInfo', ClusterSchema); // rename to cluster

module.exports = clusterSchema;
