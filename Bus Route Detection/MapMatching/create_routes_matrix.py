import numpy as np
import pandas as pd
from leuvenmapmatching.matcher.distance import DistanceMatcher
from leuvenmapmatching.map.inmem import InMemMap
from leuvenmapmatching import visualization as mmviz
import osmread
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from scipy import spatial
import time
from datetime import timedelta

start_time = time.time()


def get_path(df):
    path = []
    for i in range(len(df.iloc[0])):
        path.append((df.iloc[0][i], df.iloc[1][i]))
    return path


def timer(start, end):
    hours, rem = divmod(end - start, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)


map_con = InMemMap("myosm", use_latlon=True, use_rtree=True, index_edges=True)
for entity in osmread.parse_file('qatar.xml'):
    if isinstance(entity, osmread.Way) and 'highway' in entity.tags:
        for node_a, node_b in zip(entity.nodes, entity.nodes[1:]):
            map_con.add_edge(node_a, node_b)
            # Some roads are one-way. We'll add both directions.
            map_con.add_edge(node_b, node_a)
    if isinstance(entity, osmread.Node):
        map_con.add_node(entity.id, (entity.lat, entity.lon))
map_con.purge()

# matcher = DistanceMatcher(map_con,
#                           max_dist=50, max_dist_init=50,  # meter
#                           min_prob_norm=0.001,
#                           non_emitting_length_factor=0.75,
#                           obs_noise=50, obs_noise_ne=75,  # meter
#                           dist_noise=50,  # meter
#                           non_emitting_states=True)
matcher = DistanceMatcher(map_con,
                          max_dist=150, max_dist_init=50,  # meter
                          min_prob_norm=0.5,
                          non_emitting_length_factor=0.75,
                          obs_noise=50, obs_noise_ne=75,  # meter
                          dist_noise=50,  # meter
                          non_emitting_states=True)


def main():
    avg_time = None
    print('{0:=^120}'.format('pre processing finished'))
    print('time passed {0}'.format(timer(start_time, time.time())))
    print('{0:=^120}'.format('starting conversion'))
    conversion_time = time.time()
    trip_shapes = np.genfromtxt('trips_shapes.txt', delimiter=',')
    shapes = pd.read_csv('shapes_with_h.txt', delimiter=',')
    shapes = shapes.groupby(by='id').agg(lambda x: x.tolist())
    file = open('tris_nodes.txt', 'w+')
    shapes_len = shapes.__len__()
    for i in range(shapes_len):
        try:
            print('starting on shape {0} of {1}'.format(i, shapes_len))
            path = get_path(shapes.iloc[i])
            shape_id = shapes.iloc[i].name
            trip_id = trip_shapes[trip_shapes[:, 1] == shape_id][0][0]
            states, lastidx = matcher.match(path)
            nodes = matcher.path_pred_onlynodes
            nodes_str = []
            for node in nodes:
                nodes_str.append(str(node))
            nodes_str = ','.join(nodes_str)
            file.write(str(trip_id) + ',' + str(shape_id) + '\n' + nodes_str + '\n')
            time_passed = timer(conversion_time, time.time())
            time_passed_seconds = time.time() - conversion_time
            if not avg_time:
                avg_time = time_passed_seconds
            else:
                avg_time = (avg_time + time_passed_seconds) / 2
            remaining_time = str(timedelta(seconds=avg_time * (shapes_len - (i + 1))))
            print(
                'shape {0} done, remaining {1}, took {2}, remaining {3}'.format(shape_id, shapes_len - (i + 1),
                                                                                time_passed,
                                                                                remaining_time))
        except Exception as e:
            print('problem at shape {0} with error {1}'.format(i, str(e)))
    file.close()
    print('finished converting, took {0}'.format(timer(conversion_time, time.time())))


if __name__ == '__main__':
    main()
