const geoInfoRepo = require('../repos/TrajectoryPointRepository');
const clusterInfoRepo = require('../repos/ClusterInfoRepository');
const RouteInfo = require('../repos/RouteInfoRepository');

const config = require('../configurations');
const fetch = require("node-fetch");
const utils = require("./Utils");

class TrackingService {
    groupBy(items, key) {
        return items.reduce((result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }), {},);
    }

    async addDataPadding(data) {
        let grouped = this.groupBy(data, 'id');
        let intervalLength = 0;
        for (let key in grouped) {
            if (grouped[key].length > intervalLength) {
                intervalLength = grouped[key].length
            }
        }
        let result = [];
        for (let key in grouped) {
            if (grouped[key].length < intervalLength) {
                result.push(...grouped[key]);
                for (let i = 0; i < (intervalLength - grouped[key].length); i++) {
                    let obj = grouped[key][0];
                    result.push({obj_id: obj['id'], t: -1 * obj['time_interval'], x: 0, y: 0})
                }
            } else {
                result.push(...grouped[key]);
            }
        }
        return result
    }

    async formatCMCInput(data) {
        // format the data to match CMC input format
        let time_interval = 1;
        let last_time = new Date(data[0]['time']).getTime();
        let result = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]['time'].getTime() === last_time) {
                result.push({obj_id: data[i]['id'], t: time_interval, x: data[i]['longitude'], y: data[i]['latitude']})
            } else {
                last_time = data[i]['time'].getTime();
                time_interval++;
                result.push({obj_id: data[i]['id'], t: time_interval, x: data[i]['longitude'], y: data[i]['latitude']})
            }
        }
        result.sort((a, b) => {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            if (a.interval < b.interval) return 1;
            if (a.interval > b.interval) return -1;
        });
        result = await this.addDataPadding(result);
        return result
    }

    async clusterHistory(cluster, startDate, endDate) {
        // returns the points
        let points = await geoInfoRepo.getPointsLocations(cluster, startDate, endDate);
        points = this.groupBy(points, 'time');
        let centers = [];
        for (let key in points) {
            points[key] = points[key].map(({latitude, longitude, ...rest}) => {
                return [longitude, latitude]
            });
            centers.push(utils.getLatLngCenter(points[key]))
        }
        return centers
    }

    async discoverClusters(data, m = 2, k = 3, e = 10) {
        // let result = await geoInfoRepo.getRecent();
        data = await this.formatCMCInput(data);
        let response = await fetch(config.cmc_api + `?m=${m}&k=${k}&e=${e}`, {
            method: 'post',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const clusters = await response.json();
        // return this.clusterHistory(clusters[0],result.startDate , result.endDate);
        return clusters;
    }

    async checkPointOnTrajectory(sequence, shape_id) {
        // [ 51.53666099999999, 25.285369, 0 ]
        const xml = utils.gpx(sequence);
        const response = await fetch(config.map_matching_api + `gps_accuracy=${20}`, {
            method: 'post',
            body: xml,
            headers: {
                "Content-Type": "application/gpx+xml"
            }
        });

        let road_ids = await response.json();
        road_ids = road_ids['traversal_keys'];

        let result = await RouteInfo.check_similarity(road_ids, shape_id);
        return result
    }


    async mapMatch(sequence) {
        const xml = utils.gpx(sequence);
        const response = await fetch(config.map_matching_api + `gps_accuracy=${20}`, {
            method: 'post',
            body: xml,
            headers: {
                "Content-Type": "application/gpx+xml"
            }
        });
        let res = await response.json()
        return res.traversal_keys
    }

    async detectRoute(sequence) {
        // sequence should be in format [{long : lat}] old
        // {ids: roadIDS} new input type
        const response = await fetch(config.route_matching_api, {
            method: 'post',
            body: JSON.stringify(sequence),
            headers: {
                "Content-Type": "application/json"
            }
        });

        let jsonResult = await response.json();
        return jsonResult.top_matched
    }

}

module.exports = new TrackingService();