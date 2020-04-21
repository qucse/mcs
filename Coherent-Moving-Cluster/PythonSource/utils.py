import numpy as np
def GetCenterFromDegrees(lat1,lon1):
    if (len(lat1) <= 0):
        return false;

    num_coords = len(lat1)

    X = 0.0
    Y = 0.0
    Z = 0.0

    for i in range (len(lat1)):
        lat = lat1[i] * np.pi / 180
        lon = lon1[i] * np.pi / 180

        a = np.cos(lat) * np.cos(lon)
        b = np.cos(lat) * np.sin(lon)
        c = np.sin(lat);

        X += a
        Y += b
        Z += c


    X /= num_coords
    Y /= num_coords
    Z /= num_coords

    lon = np.arctan2(Y, X)
    hyp = np.sqrt(X * X + Y * Y)
    lat = np.arctan2(Z, hyp)

    newX = (lat * 180 / np.pi)
    newY = (lon * 180 / np.pi)
    return newX, newY
