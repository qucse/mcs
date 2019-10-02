import numpy as np
import sumolib

shapes = np.genfromtxt('GTFS/shapes.txt', delimiter=",", dtype=[('shape_id', 'i8'), ('shape_pt_lat', 'f16'),
                                                                ('shape_pt_lon', 'f16'), ('shape_pt_sequence', 'i8')])
shapes = np.sort(shapes, order=['shape_id', 'shape_pt_sequence'])
shape_ids = np.unique(shapes['shape_id'])
net = sumolib.net.readNet('qatar.net.xml')


def _get_edge_id(shape):
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
        return closest_edge.getID()
    else:
        return edges[0][0].getID()


def shape_to_edge_sequence(shape_id):
    shape_sequence = shapes[shapes['shape_id'] == shape_id]
    edges_sequence = []
    for shape in shape_sequence:
        edges_sequence.append(_get_edge_id(shape))
    edges_sequence = np.array(edges_sequence)
    edges_sequence = np.unique(edges_sequence)
    return edges_sequence


def write_to_file(filename, shape_id):
    routes = open(filename, 'w+')
    routes.write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<routes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/routes_file.xsd"> \n <vType id="pt_bus" vClass="bus"/>')
    edges = shape_to_edge_sequence(shape_id)
    string = ''
    for edge in edges:
        string += edge + " "
    routes.write('<route edges="' + string + '"/>')
