import pandas as pd
import numpy as np
import requests

url = 'http://127.0.0.1:5000/api/v1/match'
headers = {'Content-Type': 'application/json'}


def get_patch_trajectory(longs, lats, number_of_division, selected_division):
    """
    :param longs:  array of longitudes
    :param lats:  array of latitudes
    :param number_of_division: the number of parts you want to davide the data to
    :param selected_division: the number of the part you want as a return
    :return:
    """
    if selected_division > number_of_division:
        return
    size = len(lats)
    patch_size = int(np.floor(size / number_of_division))
    temp = []
    for i in range(0, (selected_division + 1) * patch_size):
        temp.append({'lat': lats[i], 'long': longs[i]})
    return temp


results = []


def main():
    data = pd.read_csv('output_data.csv')
    data = data.groupby(by='id').agg(lambda x: x.tolist())
    size = len(data)
    for i in range(size):
        shape_id = data.iloc[i].name
        print('starting on shape {0}, {1} of {2}'.format(shape_id, i, size))
        shape_res = []
        for j in range(6):
            patch = None
            if j == 5:
                patch = get_patch_trajectory(data.iloc[i][2], data.iloc[i][3], 1, 0)
            else:
                patch = get_patch_trajectory(data.iloc[i][2], data.iloc[i][3], 6, j)
            res = requests.post(url, headers=headers, json=patch)
            identified_shape = res.json()['top_matched'][0]['shape_id']
            prediction = 0
            if int(identified_shape) == int(shape_id):
                prediction = 1
            shape_res.append(prediction)
            print('finished {0}, with result {1} '.format(j, prediction))
        results.append([shape_id, shape_res])
        print('finished on shape {0}, with result of {1}'.format(shape_id, shape_res))
        file = open('1-6-testing.csv', 'w+')
        for point in results:
            line = ','
            line = line.join(np.array([point[0]] + point[1], dtype=str))
            file.write(line + '\n')
        file.close()


if __name__ == '__main__':
    main()
