const TrajectoryPoint = require('../models/TrajectoryPoint');
const fs = require('fs');

class TrajectoryPointRepository {
    // for testing only.
    async init() {
        fs.readFile('data/full_system_testing_5_route.csv', 'utf8', (err, data) => {
            if (err) throw err;
            data = data.split('\n');
            data = data.map(x => x.split(','));
            let size = data.length - 1;
            // 6 * Math.round(size / 10 )
            for (let i = 0; i < size; i = i + 1) {
                let obj = {
                    id: parseInt(data[i][0]),
                    time: new Date(data[i][1]),
                    bearing: parseFloat(data[i][2]),
                    speed: parseFloat(data[i][3]),
                    altitude: parseFloat(data[i][4]),
                    accuracy: parseFloat(data[i][5]),
                    longitude: parseFloat(data[i][6]),
                    latitude: parseFloat(data[i][7]),
                    provider: "simulation",
                };
                console.log(Math.round((i / data.length) * 100));
                new TrajectoryPoint(obj).save();
            }
        });
    }


    async getRecent(time = 1, speed = 5) {
        const time_ms = time * 60 * 1000;
        const current_date = '2020-04-06T12:00:00';
        const end_date = new Date(new Date(current_date).valueOf() - time_ms);

        // get entries in database (time in minutes ) ago nad sort on most recent
        let data = await TrajectoryPoint.find({
            speed: {$gte: speed},
            time: {$gt: end_date}
        }).sort({time: -1}).select('id time longitude latitude');
        return {data, startDate: current_date, endDate: end_date}
    }

    async addPoint(point) {
        return await new TrajectoryPoint(point).save();
    }

    async getByTime(startTime, endTime, speed = 5) {
        // get entries in database (time in minutes ) ago nad sort on most recent
        let data = await TrajectoryPoint.find({
            time: {
                $gte: startTime,
                $lte: endTime
            },
            speed: {
                $gte: speed,
            }
        }).sort({time: -1}).select('id time longitude latitude');
        return {data, startTime, endTime}

    }

    async getByIDsAndTime(ids, time) {
        return await TrajectoryPoint.find({
            id: {$in: ids},
            time: time
        })
    }

    async getPointsLocations(obj_ids, start, end) {
        return await TrajectoryPoint.find({
            id: {$in: obj_ids},
            time: {$gte: start, $lte: end}
        }).select('time longitude latitude')
    }
}

module.exports = new TrajectoryPointRepository();