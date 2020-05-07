package main;

import java.util.ArrayList;
import java.util.List;

public class CMC {

    public static List<Convoy> cm_clustering(List<Trajectory> o, int m, int k, double e) throws Exception {
        List<Convoy> V = new ArrayList<Convoy>();
        List<Convoy> V_Result = new ArrayList<Convoy>();

        int time_interval = o.get(0).points.size();
        for(int i =0; i<time_interval; i++) {
            List<Convoy> V_Next = new ArrayList<Convoy>();
            List<STPoint> tmp_point = new ArrayList<STPoint>();
            List<Convoy> snapshot_cluster = new ArrayList<Convoy>();

            for (Trajectory t : o) {
                for (STPoint s : t.points) {
                    if (s.t == i + 1)
                        tmp_point.add(s);
                }
            }

            if(tmp_point.size() < m)
                continue;

            Cluster[] C = DBSCAN.dbscan_to_cluster(tmp_point, e, m);
            for (Cluster c : C) {
                snapshot_cluster.add(new Convoy(c));
            }

            for (Convoy v : V) {
                v.assigned = false;
                for (Convoy c : snapshot_cluster) {
                    if ( c.intersection(v).size() >= m) {
                        v = c.intersection(v);
                        v.assigned = true;
                        v.endTime = i + 1;
                        V_Next.add(v);
                        c.assigned = true;
                    }
                }
                if (v.assigned == false && (v.endTime - v.startTime + 1) >= k) {
                    V_Result.add(v);
                }
            }

            for (Convoy c : snapshot_cluster) {
                if(c.assigned == false) {
                    c.startTime = i+1;
                    c.endTime = i+1;
                    V_Next.add(c);
                }
            }
            V = V_Next;
        }

        return V_Result;
    }

}

