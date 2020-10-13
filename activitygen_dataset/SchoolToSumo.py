from builtins import enumerate

import numpy as np
import sumolib
import os
import math
import matplotlib.pyplot as plt
import pyproj
import pandas as pd


def convert_to_sumo(stop_long, stop_lat, net):
    # (requires module [pyproj](https://code.google.com/p/pyproj/) to be installed)
    # for larger networks [rtree](https://pypi.org/project/Rtree/) is also strongly recommended
    radius = 0.1
    x, y = net.convertLonLat2XY(stop_long, stop_lat)  # convert stop long,lat coordinates to network x ,y coordinates
    edges = net.getNeighboringEdges(x, y, radius)
    i = 1
    while len(edges) == 0:  # keep increasing the radius until we find an edge
        edges = net.getNeighboringEdges(x, y, radius + i)
        i += i
    if len(edges) > 1:  # if more than one edge is found sort them and take the nearest one to the point
        distances_and_edges = sorted(
            [(edge, dist) for edge, dist in edges], key=lambda e: e[1])
        closest_edge, dist = distances_and_edges[0]
        return closest_edge.getLane(0).getID(), closest_edge.getLane(0).getLength()
    else:
        return edges[0][0].getID(), edges[0][0].getLength()  # if only one edge is found return
        # it with its length


net = sumolib.net.readNet('../doha.net.xml')

schools = pd.read_excel('doha_schools.xlsx')

school_to_age = {'secondary': {'beginAge': 15, 'endAge': 18}, 'primary': {'beginAge': 6, 'endAge': 12},
                 'preparatory': {'beginAge': 12, 'endAge': 15}, 'KG': {'beginAge': 2, 'endAge': 6},
                 'primary - preparatory - secondary': {'beginAge': 6, 'endAge': 18},
                 'KG - primary': {'beginAge': 2, 'endAge': 12},
                 'KG - primary - preperatory': {'beginAge': 2, 'endAge': 15},
                 'KG - primary - preparatory - secondary': {'beginAge': 2, 'endAge': 18}}

school_avg_capacity = 1750 # source https://www.meratings.com/wp-content/uploads/2019/07/Qatar-Education-Industry.pdf
school_opening = 22680
school_closing = 48600

str = ''
for i, school in schools.iterrows():
    beginAge = school_to_age[school['School Level']]['beginAge']
    endAge = school_to_age[school['School Level']]['endAge']
    opening = school_opening
    closing = school_closing
    capacity = school_avg_capacity
    edge_id, edg_length = convert_to_sumo(school.long, school.lat, net)
    pos = int(edg_length / 2.0)
    str += '<school edge="{0}" pos="{1}" beginAge="{2}" endAge="{3}" capacity="{4}" opening="{5}" closing="{6}" /> \n'.format(
        edge_id, pos, beginAge, endAge, capacity, opening, closing)
