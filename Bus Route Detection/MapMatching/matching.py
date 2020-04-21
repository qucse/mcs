import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from scipy import spatial
import time
import flask
import requests

app = flask.Flask('__name__')
app.config['DEBUG'] = True

api_url = 'http://localhost:8989/match?vehicle=car&type=json&traversal_keys=true&gps_accuracy=90'
api_header = {'Content-Type': 'application/gpx+xml'}


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


def get_seq_from_request(req_data):
    result = []
    for i in range(len(req_data)):
        result.append([req_data[i]['lat'], req_data[i]['long'], i])
    return result


def read_pre_defined_routes():
    nodes_file = 'tris_nodes.txt'
    file = open(nodes_file, 'r')
    lines = file.readlines()
    file.close()
    ids = lines[0::2]
    nodes = lines[1::2]
    return ids, nodes


# path = np.genfromtxt('trip_10.csv', delimiter=',')
ids, nodes = read_pre_defined_routes()

# make the vectorizer
vectorizer = CountVectorizer()
vectorizer.fit(nodes)
vector = vectorizer.transform(nodes)

# set up the api
app = flask.Flask('__name__')
app.config['DEBUG'] = True


@app.route('/api/v1/match', methods=['POST'])
# get a trajectory sequence and return road id
def match_trajectory():
    req_data = flask.request.get_json()
    if len(req_data) == 0:
        return 'error: provide data in the request body'
    # read the data and generate the gpx
    # data = get_seq_from_request(req_data)
    # xml = gpx(data)
    # # send xml data to the map matching api , and obtain the roads ids
    # res = requests.post(api_url, data=xml, headers=api_header).json()
    input_nodes = req_data['ids']
    # add all the roads ids in one string , to feed to sklearn algorithm
    input_str = '.'.join(np.array(input_nodes, dtype=str))
    #
    input_vector = vectorizer.transform([input_str])
    sim = []
    for i in range(len(vector.toarray())):
        sim.append(1 - spatial.distance.cosine(input_vector.toarray(), vector.toarray()[i]))
    sim = np.asarray(sim)
    top3_indexs = (-sim).argsort()[:3]
    top3_vales = sim[top3_indexs]
    top3_ides = np.array(ids)[top3_indexs]
    result = []
    for i in range(len(top3_indexs)):
        trip_shape = top3_ides[i].split(',')
        trip_shape = np.array(trip_shape, dtype=float)
        result.append({"matching": top3_vales[i], "trip_id": trip_shape[0], "shape_id":
            trip_shape[1]})

    return flask.jsonify({"top_matched": result})


app.run()
