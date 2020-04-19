#!/usr/bin/env python
""" generated source for module TrajectoryParser """
from Trajectory import Trajectory
from STPoint import STPoint
class JSONTrajectoryParser(object):
    """ generated source for class TrajectoryParser """
    data=None

    def __init__(self, data):
        """ generated source for method __init__ """
        self.data = data


    def get_traj_set(self):
        """ generated source for method get_traj_set """
        result = []
        prev_id = self.data[0]['obj_id']
        try:
            tmp = None
            for obj in self.data:
                obj_id = int(obj['obj_id'])
                if tmp == None:
                    tmp = Trajectory(obj_id)
                if tmp != None and obj_id != prev_id:
                    result.append(tmp)
                    tmp = Trajectory(obj_id)
                    prev_id = obj_id
                point = STPoint(obj_id, float(obj['t']), float(obj['x']), float(obj['y']))
                tmp.points.append(point)
            result.append(tmp)
        except Exception as e:
            print(e.message)
        return result
