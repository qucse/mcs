import numpy as np
import sumolib
import os

trips = np.genfromtxt("GTFS/trips.txt", delimiter=',', dtype=[('route_id', 'i8'), ('service_id', 'i8'), ('trip_id', 'i8'), (
    'direction_id', 'i8'), ('shape_id', 'i8'), ('trip_headsign', 'S80'), ('trip_short_name', 'S20'), ('wheelchair_accessible', 'i1'), ('bikes_allowed', 'i1')])
shapes = np.genfromtxt("GTFS/shapes.txt", delimiter=',', dtype=[('shape_id', 'i8'), ('shape_pt_lat', 'f16'), ('shape_pt_lon', 'f16'), (
    'shape_pt_sequence', 'i8')])

net = sumolib.net.readNet('qatar.net.xml')

def convert_to_sumo(shape, net):
    # (requires module [pyproj](https://code.google.com/p/pyproj/) to be installed)
    # for larger networks [rtree](https://pypi.org/project/Rtree/) is also strongly recommended
    radius = 0.1
    x, y = net.convertLonLat2XY(shape[2], shape[1])
    edges = net.getNeighboringEdges(x, y, radius)
    i = 0.1
    while len(edges) == 0:
        edges = net.getNeighboringEdges(x, y, radius + i)
        i += 0.1
    if len(edges) > 1:
        distances_and_edges = sorted(
            [(edge, dist) for edge, dist in edges], key=lambda e: e[1])
        closest_edge, dist = distances_and_edges[0]
        return closest_edge
    else:
        return edges[0][0]
s = []
for shape in shapes:
    if shape[0] == -1:
        continue
    else:
        edge = convert_to_sumo(shape)
        for sh in s:
            if(shape[0] == ):
            else:
                s.append({})

