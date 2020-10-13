from builtins import enumerate

import numpy as np
import sumolib
import os
import math
import matplotlib.pyplot as plt
import pyproj
import pandas as pd
from random import randrange, uniform

stops = np.genfromtxt("GTFS/stops.txt", delimiter=',',
                      dtype=[('stop_id', 'i8'), ('stop_name', 'S20'), ('stop_lat', 'f8'), (
                          'stop_lon', 'f8'), ('wheelchair_boarding', 'i8'), ('stop_url', 'S5'), ('location_type', 'i8'),
                             ('parent_station', 'i8')])
tirps = np.genfromtxt("GTFS/trips.txt", delimiter=',',
                      dtype=[('route_id', 'i8'), ('service_id', 'i'), ('trip_id', 'i'), (
                          'direction_id', 'i'), ('shape_id', 'i8'), ('trip_headsign', 'S'), ('trip_short_name', 'S'),
                             ('wheelchair_accessible', 'i'), ('bikes_allowed', 'i')])
shapes = np.genfromtxt('GTFS/shapes.txt', delimiter=",", dtype=[('shape_id', 'i8'), ('shape_pt_lat', 'f'),
                                                                ('shape_pt_lon', 'f'), ('shape_pt_sequence', 'f')])

stop_times = np.genfromtxt("GTFS/stop_times.txt", delimiter=',',
                           dtype=[('trip_id', 'i8'), ('arrival_time', None), ('departure_time', None), (
                               'stop_id', 'i'), ('stop_sequence', 'i8'), ('pickup_type', 'i'),
                                  ('drop_off_type', 'i')])

net = sumolib.net.readNet(
    '../doha.net.xml')  # dont change to shape_110 , infinte loop error at line 136 converttodumo


# net = sumolib.net.readNet('maps/shape_110.net.xml')


def haversine_dist(lat1, lng1, lat2, lng2):
    # from https://www.movable-type.co.uk/scripts/latlong.html
    earthRadius = 6371  # in kilometer, change to 3958.75 for miles output

    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)

    sindLat = math.sin(dLat / 2)
    sindLng = math.sin(dLng / 2)

    a = math.pow(sindLat, 2) + math.pow(sindLng, 2) * math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    dist = earthRadius * c

    return dist  # output distance, in kilometer


def convert_to_sumo(stop_long, stop_lat, net):
    # (requires module [pyproj](https://code.google.com/p/pyproj/) to be installed)
    # for larger networks [rtree](https://pypi.org/project/Rtree/) is also strongly recommended
    radius = 0.1
    x, y = net.convertLonLat2XY(stop_long, stop_lat)  # convert stop long,lat coordinates to network x ,y coordinates
    edges = net.getNeighboringEdges(x, y, radius)
    i = 0.1
    while len(edges) == 0:  # keep increasing the radius until we find an edge
        edges = net.getNeighboringEdges(x, y, radius + i)
        i += 10
        if i >= 1000:
            return None
    if len(edges) > 1:  # if more than one edge is found sort them and take the nearest one to the point
        distances_and_edges = sorted(
            [(edge, dist) for edge, dist in edges], key=lambda e: e[1])
        closest_edge, dist = distances_and_edges[0]
        return closest_edge.getLane(0).getID(), closest_edge.getLane(0).getLength()
    else:
        return edges[0][0].getLane(0).getID(), edges[0][0].getLane(0).getLength()  # if only one edge is found return
        # it with its length


def get_shape_trips(shape_id):
    # given a shape_id all the included stops will be returned
    return tirps[tirps['shape_id'] == shape_id]['trip_id']


def get_trip_bus_stops_sequence(trip_id):
    return np.stack((stop_times[stop_times['trip_id'] == trip_id]['stop_id'],
                     stop_times[stop_times['trip_id'] == trip_id]['stop_sequence']),
                    axis=1)


def write_additional_file(stops, filename='bus_stations.xml'):
    # stop id at pos 0 , lane id at pos 1 , lane length at pos 2 , stop name at pos 3.
    additional = open(filename, "w+")
    for stop in stops:
        length = float(stop[2])
        additional.write(
            '<busStation  id="' + str(stop[0]) + '" edge="' + str(stop[1]).split('_', 1)[0] + '" pos="' + str(
                length * 0.5) + '" /> <!--' + str(stop[3]) + ' -->  \n')

    additional.write('</additional>')
    additional.close()


def write_routes(bus_stops_seq, filename='bus.lines.xml'):
    # a function that writes a sequence of trips with their bus stops to a route file.
    # bus_stops_seq should be an array where every element has the shape id at pos 0 , at array representing the bus sequence at pos 1

    file = open(filename, 'w+')
    file.write(
        '<busLines>\n')
    string = ''
    for trip in bus_stops_seq:
        string += '<busLine  id="' + str(trip[0]) + '" maxTripDuration="99999" >\n'
        string += '<stations>\n'
        for (i, stop) in enumerate(trip[1]):
            string += '<stop refId="' + str(stop) + '" />\n'
        string += '</stations>\n'
        string += '<frequencies> \n<frequency begin="0" end="86400" rate="1800" /> \n</frequencies>\n'
        string += '</busLine>\n'
    string += '</busLines>\n'
    file.write(string)
    file.write('</routes>')


def num_pieces(a, n):
    # split an integer to n smaller integers that sums to the original integer
    list_split = [a / n] * n
    for i in range(2 * n):
        index1 = randrange(n)
        index2 = randrange(n)
        ammount = uniform(0.2, 0.8) * list_split[index1]
        list_split[index1] = list_split[index1] - ammount
        list_split[index2] = list_split[index2] + ammount
    return list_split


shape_ids = []

for (i, shape) in enumerate(shapes):
    if i == 0:
        continue
    shape_ids.append(shape[0])
shape_ids = np.unique(shape_ids)

trips_stops = []
for shape in shape_ids:
    trips = get_shape_trips(shape)
    if len(trips) == 0:
        continue
    trips_stops.append([shape, get_trip_bus_stops_sequence(trips[0])[:, 0]])

sumo_stops = []
stops_length = len(stops)
for (i, stop) in enumerate(stops):
    if (stops_length / (i + 1)) % 5 == 0:
        print("{0}% Done".format(round(i / stops_length, 2)))
    if stop[0] == -1:  # skipping the header
        continue
    bus_info = convert_to_sumo(stop[3], stop[2], net)
    if bus_info is None:
        continue
    lane_id, lane_length = bus_info
    stop_id = stop[0]
    stop_name = stop[1]
    # sumo_stops.append(
    #     {"stop_id": stop_id, "lane_id": lane_id, "lane_length": lane_length, "stop_name": stop_name})
    sumo_stops.append([stop_id, lane_id, lane_length, stop_name.decode()])
sumo_stops = np.array(sumo_stops)
##
# # sumo_stops[0].update({'stop_id': sumo_stops[0]["stop_id"], 'lane_id': sumo_stops[0]["lane_id"],
# #                       'lane_length': sumo_stops[0]["lane_length"], 'stop_name': sumo_stops[0]["stop_name"],
# #                       "x": net.getLane(sumo_stops[0]["lane_id"]).getShape()[1][0],
# #                       "y": net.getLane(sumo_stops[0]["lane_id"]).getShape()[1][1]})
#
# for (i, stop) in enumerate(sumo_stops):  # calculate every stop x and y position for error analysis
#     sumo_stops[i].update({'stop_id': sumo_stops[i]["stop_id"], 'lane_id': sumo_stops[i]["lane_id"],
#                           'lane_length': sumo_stops[i]["lane_length"], 'stop_name': sumo_stops[i]["stop_name"],
#                           "x": (net.getLane(sumo_stops[i]["lane_id"]).getShape()[0][0] +
#                                 net.getLane(sumo_stops[i]["lane_id"]).getShape()[-1][0]) / 2,  # midle of the lane
#                           "y": (net.getLane(sumo_stops[i]["lane_id"]).getShape()[0][1] +
#                                 net.getLane(sumo_stops[i]["lane_id"]).getShape()[-1][1]) / 2})
#
# diff_distance = []  # contain the distance in kilometer between the generated stop location and the original stop position
# for (i, stop) in enumerate(sumo_stops):
#     point1 = net.convertXY2LonLat(stop["x"], stop["y"])  # point in long , lat order
#     point2 = (stops[i + 1][3], stops[i + 1][2])  # i+1 to skip the header at index 0
#     dist = haversine_dist(point1[1], point1[0], point2[1], point2[0])
#     diff_distance.append(dist)
#
# for (i, stops) in enumerate(diff_distance):  # make the distance in meters
#     diff_distance[i] = diff_distance[i] * 1000
# # setting the histogram plot
# plt.hist(diff_distance, bins=int(180 / 2), color='blue', edgecolor='black')
# plt.xticks([ 100,  500, 1000, 2000, 3000, 4000, 5000, 8000])
# plt.xticks(rotation=90)
# plt.title("distance between generated stops and original stops")
# plt.xlabel("distance (meters)")
# plt.ylabel("number of stops")
# plt.show()

doha_trips = []
for trip in trips_stops:
    doha_bsid = pd.DataFrame(data={'stop_id': sumo_stops[:, 0]}, dtype=int)
    trip_ok = True
    for stop in trip[1]:
        if not (stop in doha_bsid['stop_id'].unique()):
            trip_ok = False
            break
    if trip_ok:
        doha_trips.append(trip)
