package main;

/**
 * Created by wschoi on 2015-11-17.
 * Spatio-temporal point
 */

public class STPoint extends javafx.geometry.Point2D{

    int cluster_id; // unclassifed = 0, noise = -1
    int oid;
    double t;

    public STPoint(int oid, double t, double x, double y) {
        super(x,y);
        this.t=t;
        this.oid=oid;
    }

    public STPoint( double x, double y) {
        super(x, y);
        this.t= -1;
        this.oid=-1;
    }

    public double getT() {return t;}
    public int getOid() {
        return oid;
    }


    public int getCluster_id() {return cluster_id; }
    public boolean isUnClassified() { return (cluster_id == 0); }
    public boolean isNoise() { return (cluster_id == -1 );}
    public void setCluster_id(int cluster_id) { this.cluster_id = cluster_id;}

}
