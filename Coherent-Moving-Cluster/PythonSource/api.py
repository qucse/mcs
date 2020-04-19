import flask
from flask import request, jsonify
from JSONTrajectoryParser import JSONTrajectoryParser as JTP
from CMC import CMC
from TrajectoryParser import TrajectoryParser

app = flask.Flask('__name__')
app.config['DEBUG'] = True


@app.route('/', methods=['GET'])
def home():
    return '<h1> home </h1>'


@app.route('/api/v1/CMC', methods=['POST'])
# gets a data representing tajectory movement of poject for a specific time period , and return its CMC classificaiton
def api_cmc():
    req_data = request.get_json()
    if len(req_data) == 0:
        return 'error: provide data in the request body'
    parser = JTP(req_data)
    traj_set = parser.get_traj_set()
    m = int(request.args['m'])
    k = int(request.args['k'])
    e = int(request.args['e'])
    result = CMC.cm_clustering(traj_set, m, k, e)
    clusters = []
    for conv in result:
        clusters.append(conv.cluster.oids)
    return jsonify(clusters)


app.run(port=5050)
