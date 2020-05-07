const mocha = require("mocha"),
    chai = require("chai"),
    chaiHttp = require("chai-http"),
    mongoose = require('mongoose');
expect = chai.expect;

const should = chai.should();
const clusterInfoRepository = require("../repos/ClusterInfoRepository");
const routeInfoRepository = require("../repos/RouteInfoRepository");
const trajectoryPointRepository = require('../repos/TrajectoryPointRepository');
chai.use(chaiHttp);

before(async () => {
    await mongoose.connect('mongodb://localhost:27017/CSJTP-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await mongoose.connection.db.dropDatabase()
});

beforeEach(async () => {
    await mongoose.connection.db.dropDatabase()
});

describe('clusterInfo repository test', function () {
    it('should add a SINGLE cluster', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then(res => {
            res.should.have.property('_id');
            done();
        });
    });
    it('should get a single cluster from ID', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then(res => {
            res.should.have.property('_id');
            let _id = res._id;
            clusterInfoRepository.getWithId(_id).then(cluster => {
                expect(cluster.passengers).to.have.all.members(res.passengers);
                expect(cluster.shapeId).to.equal(res.shapeId);
                expect(cluster.routeId).to.equal(res.routeId);
                expect(cluster.deviationCounter).to.equal(res.deviationCounter);
                done()
            });
        });
    });
    it('should update SINGLE cluster', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then(res => {
            res.should.have.property('_id');
            let _id = res._id;
            testCluster.shapeId = 3030;
            clusterInfoRepository.update(testCluster, _id).then(updated => {
                expect(updated.ok).to.equal(1);
                done();
            });
        });

    });
    it('Should get all clusters', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then(res => {
            clusterInfoRepository.getAllClusters().then(clusters => {
                expect(clusters).to.be.an('Array');
                expect(clusters[0]).to.have.property('passengers');
                expect(clusters[0]).to.have.property('shapeId');
                expect(clusters[0]).to.have.property('routeId');
                expect(clusters[0]).to.have.property('history');
                expect(clusters[0]).to.have.property('deviationCounter');
                expect(clusters[0]).to.have.property('lastUpdated');
                done();
            })
        })
    });
    it('should return bus location from shape id', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then(() => {
            clusterInfoRepository.liveLocation(110).then(res => {
                expect(res).to.be.an('Array');
                expect(res[0]).to.have.property('position').which.is.an('Array');
                expect(res[0]).to.have.property('lastUpdated');
                done()
            });
        });
    });
    it('should get similar clusters to the added cluster', function (done) {
        let testCluster = {
            "passengers": [1, 2, 3, 4],
            "shapeId": 110,
            "routeId": 11,
            "history": [
                [51.538, 25.123],
                [51.738, 25.253]
            ],
            "deviationCounter": 0,
            "lastUpdated": new Date('2020-04-06T09:06:40.000+00:00'),
        };
        clusterInfoRepository.addCluster(testCluster).then((addedCluster) => {
            let id = addedCluster._id;
            clusterInfoRepository.getSimilar(testCluster).then(res => {
                expect(res).to.be.an('Array');
                expect(res[0]).to.have.property('_id');
                expect(res[0]).to.have.property('score').that.equal(1);
                expect(res[0]._id).to.deep.equal(id);
                clusterInfoRepository.getSimilar({passengers: [70, 80, 90]}).then(res => {
                    expect(res).to.be.an('Array');
                    expect(res.length).to.be.equal(0);
                    done()
                });
            })
        })

    });
});

describe('RouteInfo Repository test', function () {
    it('should add route to the routes table', function (done) {
        let testRoute = {
            "road_ids": [40235, 40233, 36085, 12332, 28878, 36623, 36440],
            "trip_id": 12,
            "shape_id": 120,
        };
        routeInfoRepository.add_route(testRoute).then(res => {
            res.should.be.an('object');
            res.should.have.property('road_ids').which.is.an('Array');
            res.should.have.property('trip_id');
            res.should.have.property('shape_id');
            res.should.have.property('_id');
            done()
        })

    });
    it('should check route similarity', function (done) {
        let testRoute = {
            "road_ids": [40235, 40233, 36085, 12332, 28878, 36623, 36440],
            "trip_id": 12,
            "shape_id": 120,
        };
        routeInfoRepository.add_route(testRoute).then((addRoute) => {
            let id = addRoute._id;
            routeInfoRepository.check_similarity(testRoute.road_ids, testRoute.shape_id).then(res => {
                expect(res).to.be.an('Array');
                expect(res[0]).to.have.property('_id');
                expect(res[0]._id).to.deep.equal(id);
                expect(res[0]).to.have.property('score').which.is.equal(1);
                done()
            })
        })

    });
    it('should return all shapes and routes combinations', function (done) {
        let testRoute = {
            "road_ids": [40235, 40233, 36085, 12332, 28878, 36623, 36440],
            "trip_id": 12,
            "shape_id": 120,
        };
        routeInfoRepository.add_route(testRoute).then(() => {
            routeInfoRepository.getShapesAndRoutes().then(res => {
                expect(res).to.be.an('array');
                expect(res[0]).to.have.property('trip_id').which.is.an('number');
                expect(res[0]).to.have.property('shape_id').which.is.an('number');
                done()
            })
        })
    });
});

describe('Testing Trajectory Point Repository', function () {
    it('should Add trajectory point', function (done) {
        let testPoint = {
            "id": 811000,
            "time": new Date(1586163600000),
            "bearing": 0,
            "speed": 0,
            "altitude": 70,
            "accuracy": 100,
            "longitude": 51.536661,
            "latitude": 25.285369,
            "provider": "simulation",
        };
        trajectoryPointRepository.addPoint(testPoint).then(res => {
            expect(res).to.have.property('_id');
            done();
        })
    });
    it('should get trajectory points by time', function (done) {
        let testPoint = {
            "id": 811000,
            "time": new Date(1586163600000),
            "bearing": 0,
            "speed": 0,
            "altitude": 70,
            "accuracy": 100,
            "longitude": 51.536661,
            "latitude": 25.285369,
            "provider": "simulation",
        };
        trajectoryPointRepository.addPoint(testPoint).then((addedPoint) => {
            let id = addedPoint._id;
            trajectoryPointRepository.getByTime(testPoint.time, testPoint.time).then(res => {
                expect(res).to.be.an('object');
                expect(res).to.have.property('data').which.is.an('array');
                expect(res).to.have.property('startTime');
                expect(res).to.have.property('endTime');
                expect(res.data[0]._id).to.deep.equal(id);
                done()
            })
        })
    });
    it('should get trajectory points by time and id', function (done) {
        let testPoint = {
            "id": 811000,
            "time": new Date(1586163600000),
            "bearing": 0,
            "speed": 0,
            "altitude": 70,
            "accuracy": 100,
            "longitude": 51.536661,
            "latitude": 25.285369,
            "provider": "simulation",
        };
        trajectoryPointRepository.addPoint(testPoint).then((addedPoint) => {
            let id = addedPoint.id;
            trajectoryPointRepository.getByIDsAndTime([id], testPoint.time).then(res => {
                expect(res).to.be.an('array');
                expect(res[0]).to.have.property('id').which.is.deep.equal(id);
                done()
            })
        })
    });
    it('should get trajectory positions', function (done) {
        let testPoint = {
            "id": 811000,
            "time": new Date(1586163600000),
            "bearing": 0,
            "speed": 0,
            "altitude": 70,
            "accuracy": 100,
            "longitude": 51.536661,
            "latitude": 25.285369,
            "provider": "simulation",
        };
        trajectoryPointRepository.addPoint(testPoint).then((addedPoint) => {
            let id = addedPoint.id;
            trajectoryPointRepository.getPointsLocations([id], testPoint.time, testPoint.time).then(res => {
                expect(res).to.be.an('array');
                expect(res[0]).to.have.property('time');
                expect(res[0]).to.have.property('longitude');
                expect(res[0]).to.have.property('latitude');
                done()
            })
        })
    });
});

after(async () => {
    await mongoose.disconnect()
});