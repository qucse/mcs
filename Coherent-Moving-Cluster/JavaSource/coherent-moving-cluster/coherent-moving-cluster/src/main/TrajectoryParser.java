package main;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


public class TrajectoryParser {

    File inputFile;
    BufferedReader reader;
    String delim = ",";

    public TrajectoryParser(String path) throws IOException {

        inputFile = new File(path);
        try {
            reader = new BufferedReader(new FileReader(inputFile));
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            System.err.println("Cannot find File.");
        }

    }

    public List<Trajectory> get_traj_set() {
        List<Trajectory> result = new ArrayList<Trajectory>();
        try {
            String line = "";
            reader.readLine();
            int prev_id = 1;
            Trajectory tmp = null;
            while ((line = reader.readLine()) != null) {
                String[] data = line.split(delim);
                int obj_id = Integer.parseInt(data[0]);
                if(tmp == null) {
                    tmp = new Trajectory(obj_id);
                }
                if(tmp != null && obj_id != prev_id) {
                    result.add(tmp);
                    tmp = new Trajectory(obj_id);
                    prev_id = obj_id;
                }
                STPoint point = new STPoint(
                        obj_id,
                        Double.parseDouble(data[1]),
                        Double.parseDouble(data[2]),
                        Double.parseDouble(data[3])
                );
                tmp.points.add(point);
            }
        } catch(IOException e) {
            e.printStackTrace();
        }

        return result;
    }
}