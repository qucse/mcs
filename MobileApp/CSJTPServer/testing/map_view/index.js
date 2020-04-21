let map = L.map('map').setView([25.27872, 51.50696], 13);
L.tileLayer('https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=YvjfItK8XO38uwADRsrJ', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    crossOrigin: true
}).addTo(map);

let marker = L.marker([25.27983, 51.53517]).addTo(map);
utils.readFile('data/trip_10.csv').then(res => {
    res = res.map(x => {
        let temp = x.split(',');
        return [parseFloat(temp[0]), parseFloat(temp[1])]
    });
    let polygon = L.polygon(res).addTo(map);
});

