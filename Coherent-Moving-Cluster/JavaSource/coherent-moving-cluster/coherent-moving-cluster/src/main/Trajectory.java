package main;

import java.util.ArrayList;
import java.util.Iterator;

public class Trajectory {

    int o_id;
    ArrayList<STPoint> points;

    public Trajectory(int o_id) {

        this.o_id = o_id;
        points = new ArrayList<STPoint>();

    }

    public STPoint getPointAt(double t){

        Iterator<STPoint> iter = points.iterator();

        for (STPoint point : points) {
            if(point.getT() == t) return point;
        }

        return null;
    }

    public ArrayList<STPoint> getPoints() {
        return points;
    }
    public int getO_id() {
        return o_id;
    }
}
