#!/usr/bin/env python
""" generated source for module STPoint """
import math

class STPoint:
    """ generated source for class STPoint """
    cluster_id = int()
    oid = int()
    t = float()
    x = float()
    y = float()

    def __init__(self, oid=None, t=-1, x=0, y=0):
        self.t = t
        self.oid = oid
        self.x = x
        self.y = y

    def getT(self):
        """ generated source for method getT """
        return self.t

    def getOid(self):
        """ generated source for method getOid """
        return self.oid

    def getCluster_id(self):
        """ generated source for method getCluster_id """
        return self.cluster_id

    def isUnClassfied(self):
        """ generated source for method isUnClassified """
        return (self.cluster_id == 0)

    def isNoise(self):
        """ generated source for method isNoise """
        return (self.cluster_id == -1)

    def setCluster_id(self, cluster_id):
        """ generated source for method setCluster_id """
        self.cluster_id = cluster_id

    def distance(self, x2, y2):
        # x2 = x2 - self.x
        # y2 = y2 - self.y
        # sum = x2 * x2 + y2 * y2
        # return math.sqrt(sum)
        '''calculates the distance between two lat, long coordinate pairs'''
        R = 6371000  # radius of earth in m
        lat1rads = math.radians(self.y)
        lat2rads = math.radians(y2)
        deltaLat = math.radians((y2 - self.y))
        deltaLng = math.radians((x2 - self.x))
        a = math.sin(deltaLat / 2) * math.sin(deltaLat / 2) + math.cos(lat1rads) * math.cos(lat2rads) * math.sin(
            deltaLng / 2) * math.sin(deltaLng / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        d = R * c
        return d
