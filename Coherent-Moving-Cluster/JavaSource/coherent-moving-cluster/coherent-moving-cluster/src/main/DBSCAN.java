package main;

import java.util.ArrayList;
import java.util.List;

public class DBSCAN {

    public static Cluster[] dbscan_to_cluster(List<STPoint> datalist, double eps, int minPts) throws Exception {

        initialize(datalist);
        int num_cluster = dbscan(datalist, eps, minPts);

        ArrayList<Cluster> result = new ArrayList<Cluster>(num_cluster+1);

        for (STPoint point : datalist) {

            if(point.getCluster_id()==-1) continue;
            boolean find_cluster = false;

            for (Cluster cluster_set : result) {

                if(cluster_set.getCluster_id() == point.getCluster_id())
                {
                    cluster_set.add(point.getOid());
                    find_cluster = true;
                    break;
                }
            }

            if(!find_cluster) {
                int new_c_id = point.getCluster_id();
                Cluster new_cluster = new Cluster(new_c_id);
                new_cluster.add(point.getOid());
                result.add(new_cluster);
            }
        }
        return result.toArray(new Cluster[0]);
    }

    private static void initialize(List<STPoint> datalist){

        for (STPoint point : datalist) {
            if(!point.isUnClassified()) point.setCluster_id(0);
        }

    }


    //ORIGINAL main.DBSCAN Algorithm
    //Ester, Martin, et al. "A density-based algorithm for discovering clusters in large spatial databases with noise." Kdd. Vol. 96. No. 34. 1996.

    private static int dbscan(List<STPoint> datalist, double eps, int minPts) throws Exception {

        int cluster_Id = 1;

        for (STPoint point : datalist) //main.STPoint := SetOfPoints.get(i);
            if(point.isUnClassified()) //IF main.STPoint.CiId = UNCLASSIFIED THEN
                if(expandCluster(datalist, point, cluster_Id, eps, minPts))
                    //IF ExpandCluster(SetOfPoints, main.STPoint, ClusterId, Eps, MinPts) THEN
                    cluster_Id++; //ClusterId := nextId(ClusterId)

        return --cluster_Id;

    }

    private static boolean expandCluster(List<STPoint> datalist,
                                         STPoint point, int clu_Id, double eps, int minPts){

        List<STPoint> seeds = regionQuery(datalist, point, eps); //seeds : =SetOfPoints. regionQuery (main.STPoint, Eps )

        if(seeds.size() < minPts) //IF seeds.size<MinPts THEN // no core point
        {

            chg_clu_id(point, -1); //SetOfPoint. changeCl Id (main.STPoint, NOISE)
            return false;
        }

        else
        {
            // all points in seeds are density-
            // reachable from main.STPoint

            for (STPoint tuple : seeds) {
                chg_clu_id(tuple, clu_Id);
            } // SetOfpoints. changeCiIds ( seeds, C1 Id)

            seeds.remove(point); //seeds .delete (main.STPoint)

            while(!seeds.isEmpty())    //WHILE seeds <> Empty DO
            {

                STPoint currentP = seeds.get(0); //currentP := seeds.first()

                List<STPoint> result = regionQuery(datalist, currentP, eps); //result := setofPoints.regionQuery(currentP,Eps)

                if(result.size() >= minPts)
                    for (STPoint resultP : result) {
                        if(resultP.isUnClassified())
                        {
                            seeds.add(resultP);
                            chg_clu_id(resultP, clu_Id);
                        }
                        else if (resultP.isNoise())
                            chg_clu_id(resultP, clu_Id);
                    }

                seeds.remove(0);
            }

            return true;
        }
    }

    private static List<STPoint> regionQuery(List<STPoint> datalist, STPoint query, double eps) {

        ArrayList<STPoint> result = new ArrayList<STPoint>();

        for (STPoint point : datalist) {
            if(query.distance(point) <= eps)
                result.add(point);
        }
        return result;
    }

    private static void chg_clu_id (STPoint data, int cluster_id)
    {
        data.setCluster_id(cluster_id);

/*        for (main.STPoint dataTuple : datalist) {

            if(dataTuple.id == data.id)
                dataTuple.cluster_id = cluster_id;

        }

        take_sleep();*/
    }
    private static boolean validate_parameter(double eps, int minPts) {

        if(eps<0 || minPts<1) return false;
        return true;

    }
}
