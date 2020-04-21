const fs = require('fs');

class Utils {

    rad2degr(rad) {
        return rad * 180 / Math.PI;
    }

    degr2rad(degr) {
        return degr * Math.PI / 180;
    }

    getLatLngCenter(latLngInDegr) {
        /**
         * @param latLngInDeg array of arrays with latitude and longtitude
         *   pairs in degrees. e.g. [[latitude1, longtitude1], [latitude2
         *   [longtitude2] ...]
         *
         * @return array with the center latitude longtitude pairs in
         *   degrees.
         */
        let LATIDX = 0;
        let LNGIDX = 1;
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;

        for (let i = 0; i < latLngInDegr.length; i++) {
            let lat = this.degr2rad(latLngInDegr[i][LATIDX]);
            let lng = this.degr2rad(latLngInDegr[i][LNGIDX]);
            // sum of cartesian coordinates
            sumX += Math.cos(lat) * Math.cos(lng);
            sumY += Math.cos(lat) * Math.sin(lng);
            sumZ += Math.sin(lat);
        }

        let avgX = sumX / latLngInDegr.length;
        let avgY = sumY / latLngInDegr.length;
        let avgZ = sumZ / latLngInDegr.length;

        // convert average x, y, z coordinate to latitude and longtitude
        let lng = Math.atan2(avgY, avgX);
        let hyp = Math.sqrt(avgX * avgX + avgY * avgY);
        let lat = Math.atan2(avgZ, hyp);
        return ([this.rad2degr(lat), this.rad2degr(lng)]);
    }

    gpx(path) {
        let xml = `<?xml version="1.0"?>
        <gpx version="1.1" creator="gpxgenerator.com">
            <trk><name>GraphHopper</name><trkseg>
        `;
        path.forEach((point) => {
            const t = new Date(point[2] * 2 * 60 * 1000).toISOString();
            xml += `<trkpt lat="${point[1]}" lon="${point[0]}">
            <time>${t}</time>
            </trkpt>
            `;
        });
        xml += `</trkseg>
            </trk>
            </gpx>`;
        return xml
    }

    readFile(path) {
        let data = fs.readFileSync(path, 'utf8');
        return data.split('\n');
    }
}

module.exports = new Utils();