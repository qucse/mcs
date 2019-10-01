import numpy as np
import sumolib
import os

data = np.genfromtxt("GTFS/stops.txt", delimiter=',',
                     dtype=[('stop_id', 'i8'), ('stop_name', 'S20'), ('stop_lat', 'f16'), ('stop_lon', 'f16'),
                            ('wheelchair_boarding', 'i8'), ('stop_url', 'S5'), ('location_type', 'i8'),
                            ('parent_station', 'i8')])

net = sumolib.net.readNet('qatar.net.xml')


def convert_to_sumo(stop, net):
    # (requires module [pyproj](https://code.google.com/p/pyproj/) to be installed)
    # for larger networks [rtree](https://pypi.org/project/Rtree/) is also strongly recommended
    radius = 0.1
    x, y = net.convertLonLat2XY(stop[3], stop[2])
    edges = net.getNeighboringEdges(x, y, radius)
    i = 0.1
    while len(edges) == 0:
        edges = net.getNeighboringEdges(x, y, radius + i)
        i += 0.1
    if len(edges) > 1:
        distances_and_edges = sorted([(edge, dist) for edge, dist in edges], key=lambda e: e[1])
        closest_edge , dist= distances_and_edges[0]
        return closest_edge.getLane(0).getID()
    else:
        return edges[0][0].getLane(0).getID()


sumo_stops = []
for stop in data:
    if stop[0] == -1:
        continue
    lane_id = convert_to_sumo(stop, net)
    stop_id = stop[0]
    sumo_stops.append({"stop_id": stop_id, "lane_id": lane_id})
    print("stop " + str(stop_id) + "done")
