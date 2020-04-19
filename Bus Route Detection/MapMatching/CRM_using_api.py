import time
from datetime import timedelta
import pandas as pd
import numpy as np
import requests
import traceback

api_url = 'http://localhost:8989/match?vehicle=car&type=json&traversal_keys=true&gps_accuracy=90'
api_header = {'Content-Type': 'application/gpx+xml'}
# error dist distribution
all_diff = []


def get_path(df):
    path = []
    for i in range(len(df.iloc[0])):
        path.append((df.iloc[0][i], df.iloc[1][i], df.iloc[2][i]))
    return path


def timer(start, end):
    hours, rem = divmod(end - start, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)


def gpx(path):
    xml = """<?xml version="1.0"?>
       <gpx version="1.1" creator="gpxgenerator.com">
       <trk><name>GraphHopper</name><trkseg>
       """
    for point in path:
        t = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(point[2] * 2 * 60))
        xml += """<trkpt lat="{0}" lon="{1}">
            <time>{2}</time>
            </trkpt>
           """.format(point[0], point[1], t)
    xml += """</trkseg>
        </trk>
       </gpx>
       """
    return xml


def main():
    avg_time = None
    print('{0:=^120}'.format('starting conversion'))
    trip_shapes = np.genfromtxt('trips_shapes.txt', delimiter=',')
    shapes = pd.read_csv('shapes_with_h.txt', delimiter=',')
    shapes = shapes.groupby(by='id').agg(lambda x: x.tolist())
    file = open('trips_nodes.txt', 'w+')
    shapes_len = shapes.__len__()
    total_time = time.time()
    for i in range(shapes_len):
        try:
            conversion_time = time.time()
            print('starting on shape {0} of {1}'.format(i, shapes_len))
            path = get_path(shapes.iloc[i])
            shape_id = shapes.iloc[i].name
            trip_id = trip_shapes[trip_shapes[:, 1] == shape_id][0][0]
            # get the roads ids.
            xml = gpx(path)
            res = requests.post(api_url, data=xml, headers=api_header).json()

            # calculate accuracy
            diff = abs(res['map_matching']['original_distance'] - res['map_matching']['distance']) / \
                   res['map_matching'][
                       'original_distance'] * 100
            diff = round(diff, 2)
            all_diff.append(diff)
            # get nodes and write them to the file
            nodes = res['traversal_keys']
            nodes_str = []
            for node in nodes:
                nodes_str.append(str(node))
            nodes_str = ','.join(nodes_str)
            file.write(str(trip_id) + ',' + str(shape_id) + '\n' + nodes_str + '\n')
            # calculate time
            time_passed = timer(conversion_time, time.time())
            time_passed_seconds = time.time() - conversion_time
            if not avg_time:
                avg_time = time_passed_seconds
            else:
                avg_time = (avg_time + time_passed_seconds) / 2
            remaining_time = str(timedelta(seconds=avg_time * (shapes_len - (i + 1))))
            print(
                'shape {0} done with difference {1}%, remaining {2}, took {3}, remaining {4}'.format(shape_id, diff,
                                                                                                     shapes_len - (
                                                                                                             i + 1),
                                                                                                     time_passed,
                                                                                                     remaining_time))
        except Exception as e:
            print(type(e.__traceback__))
            print('problem at shape {0} with error {1}'.format(i, str(e)))
            traceback.print_exc()
    file.close()
    avg_diff = np.average(all_diff)
    avg_diff = round(avg_diff, 2)
    print(
        'finished converting, took {0} , with avg difference of {1} %'.format(timer(total_time, time.time()), avg_diff))


if __name__ == '__main__':
    main()
