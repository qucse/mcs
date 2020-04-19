#!/usr/bin/env python
""" generated source for module Cluster """
import utils
import numpy as np


class Cluster:
    """ generated source for class Cluster """
    cluster_id = int()
    oids = []
    points = []

    def __init__(self, cluster_id):
        """ generated source for method __init__ """

        self.cluster_id = cluster_id
        self.oids = []
        self.points = []

    def getCluster_id(self):
        """ generated source for method getCluster_id """
        return self.cluster_id

    def getClusterCenter(self):
        x = []
        y = []
        for point in self.points:
            x.append(point.x)
            y.append(point.y)
        return utils.GetCenterFromDegrees(x, y)
