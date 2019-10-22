import numpy as np
import sumolib
import GeoConverter as gc
from anytree import Node, RenderTree

shapes = np.genfromtxt('GTFS/shapes.txt', delimiter=",", dtype=[('shape_id', 'i8'), ('shape_pt_lat', 'f16'),
                                                                ('shape_pt_lon', 'f16'), ('shape_pt_sequence', 'f8')])
# shapes = np.sort(shapes, order=['shape_id', 'shape_pt_sequence'])
shape_ids = np.unique(shapes['shape_id'])
net = sumolib.net.readNet('shape_110.net.xml')


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


def shape_to_edge_sequence(shape_sequence):
    edges_sequence = []
    for shape in shape_sequence:
        edges_sequence.append(_get_edge_id(shape))
    edges_sequence = np.array(edges_sequence)
    print('clearing .......')
    _, idx = np.unique(edges_sequence, return_index=True)
    edges_sequence = edges_sequence[np.sort(idx)]
    return edges_sequence


def fine_grain(shape_id, shape_points):
    """ this method take a sequence of longitude and latitude points
    and adds points between every 2 points with interval with a given interval  """
    offset = 0
    new_shape = np.copy(shape_points)
    for (i, shape_point) in enumerate(shape_points):
        if i == len(shape_points) - 1: break
        points = gc.get_points_between(10, shape_points[i][1], shape_points[i][2], shape_points[i + 1][1],
                                       shape_points[i + 1][2])
        for (j, point) in enumerate(points):
            new_shape = np.insert(new_shape, i + 1 + offset, (shape_id, point[0], point[1], (i + 1) + 0.0001 * (j + 1)))
            offset += 1
    return new_shape


def _get_out_going(edge):
    ids = []
    for edge in (edge.getOutgoing()):
        ids.append(edge.getID())
    return ids


def _get_in_going(edge):
    ids = []
    for edge in (edge.getIncoming()):
        ids.append(edge.getID())
    return ids


def clean_sequence(edges_sequence, net):
    """ this function is used to clean edges sequence generated from shape_to_edge_sequence function"""
    modified_sequence = np.copy(edges_sequence)
    replica_offset = 0
    original_offset = 0
    for i in range(0, np.size(edges_sequence)):
        if i + original_offset < edges_sequence.size - 1:
            replica_pinter = i + replica_offset
            original_pinter = i + original_offset
            out_going_edges = _get_out_going(net.getEdge(edges_sequence[original_pinter]))
            continuous = False
            for out_edge in out_going_edges:
                if out_edge == edges_sequence[original_pinter + 1]:
                    continuous = True
                    break
            if continuous:
                print('clean edge at', edges_sequence[original_pinter])
                continue
            else:
                wrong_turn = False
                if i != 0:
                    out_previous = _get_out_going(net.getEdge(edges_sequence[original_pinter - 1]))
                    in_next = _get_in_going(net.getEdge(edges_sequence[original_pinter + 1]))
                    common = np.intersect1d(out_previous, in_next)
                    if np.size(common) != 0:
                        wrong_turn = True
                    if wrong_turn:
                        print('wrong turn at', edges_sequence[original_pinter])
                        np.put(modified_sequence, replica_pinter, common[0])
                    else:
                        print("redundant at", edges_sequence[original_pinter])
                        modified_sequence = np.delete(modified_sequence, replica_pinter + 1)
                        replica_offset -= 1
                        original_offset += 1
    return modified_sequence


def write_to_file(filename, edges_sequence):
    routes = open(filename, 'w+')
    routes.write(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<routes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/routes_file.xsd"> \n' +
        '<vType id="pt_bus" vClass="bus"/>\n')
    string = ''
    for edge in edges_sequence:
        string += edge + " "
    routes.write('<route id="pt_subway_Red:1" edges="' +
                 string + '"> </route>')
    routes.write(
        '<flow id="pt_subway_Red:0" type="pt_bus" route="pt_subway_Red:1" begin="15.0" end="3615.0" period="600" line="Red:0" >' +
        '<param key="name" value="الخط الأحمر للمترو: القصار ← الوكرة"/>' +
        '<param key="completeness" value="0.77"/>' +
        '</flow>')
    # routes.write(
    #     '<flow id="pt_bus" from="' + edges[0] + '" to="' + edges[len(edges)-1] + '" type="bus" begin="0" period="10000" />\n')
    routes.write('</routes>')


def dist(edge1, edge2):
    """get Euclidean distance between 2 edges"""
    edge1_loc = edge1.getToNode().getCoord()
    edge2_loc = edge2.getToNode().getCoord()
    dist = np.linalg.norm(np.array(edge1_loc) - np.array(edge2_loc))
    return dist


def shortest_path(start, end, net):
    """ this function will return the shortest path
     as a sequence of edge ids between 2 edges using Euclidean distance"""
    seq = []
    back_track = []
    seq.append(start.getID())
    root_distance = dist(start, end)
    root = Node({'edge': start, 'distance': root_distance})
    current = root
    found = False
    while not found:
        out_edges_ids = _get_out_going(current.name['edge'])
        out_edges = []
        for edge_id in out_edges_ids:
            edge = net.getEdge(edge_id)
            distance = dist(edge, end)
            out_edges.append({"edge": edge, "distance": distance})
            if distance == 0:
                found = True
                break
        out_edges = sorted(out_edges, key=lambda k: k['distance'])
        for edge in out_edges:
            Node(edge, current)
        if current.name['distance'] + 0.05 * current.name['distance'] < current.children[0].name['distance'] and np.size(back_track) != 0:
            current = back_track.pop()
            # seq.pop()
            print('back track at', seq.pop())
            seq.append(current.name['edge'].getID())
            continue
        for (i, child) in enumerate(current.children):
            if i == 0 and not seq.__contains__(child.name['edge'].getID()):
                current = child
                seq.append(current.name['edge'].getID())
            else:
                back_track_size = np.size(back_track)
                if back_track_size == 0:
                    back_track.append(child)
                else:
                    if back_track[back_track_size - 1].name['distance'] >= child.name[
                        'distance'] and not seq.__contains__(child.name['edge'].getID()):
                        back_track.append(child)
        print(seq)
        print(found)
    return seq


# write_to_file('routes.xml', 310)
# shape_to_edge_sequence(310)
new_110 = fine_grain(110, shapes[shapes["shape_id"] == 110])
# edges_110 = shape_to_edge_sequence(new_110)
edges_110 = np.genfromtxt('edges_110.txt', delimiter='\n', dtype=str, comments=None)
# clean_110 = clean_sequence(edges_110, net)
# shortest_path(net.getEdge("158194880#1"), net.getEdge("158426339#0"), net)
shortest_path(net.getEdge("95475538#1"), net.getEdge("165499564"), net)