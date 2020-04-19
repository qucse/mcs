from TrajectoryParser import TrajectoryParser
from CMC import CMC

if __name__ == '__main__':
    parser = TrajectoryParser("resource/testing/testing.csv")
    traj_set = parser.get_traj_set()
    res = CMC.cm_clustering(traj_set, 3, 3, 10)
    for conv in res:
        print(conv.toString())
