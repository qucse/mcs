# coherent-moving-cluster
Assignment for Distributed Mobile Data Management

Based on [this repository](https://github.com/ws-choi/CMC_assignment_JAVA)

##Convoy Query
Input

  - a set of trajectories of N objects: List(Trajectory)
  - an integer m: int m
  - an integer lifetime k: int k
  - and a distance threshold e: double e
  
Output

  - All possible groups of objects, so that each group consists of a (maximal) set of density-connected objects with respect to e and m during at least k consecutive time points

##Description

1. perform processing for each time point.
2. apply [DBSCAN] (https://github.com/se0kjun/coherent-moving-cluster/blob/master/src/DBSCAN.java#L6) and [get clusters](https://github.com/se0kjun/coherent-moving-cluster/blob/master/src/CMC.java#L26)
3. the cluster is compared to existing candidates in V
4. clusters (in C) having insufficient [intersections](https://github.com/se0kjun/coherent-moving-cluster/blob/master/src/Convoy.java#L36) with existing candidates are inserted as new candidates into V_next
5. then all candidates in V_next are copied to V so that they are used for further processing in the next iteration



##Result

![](https://raw.githubusercontent.com/se0kjun/coherent-moving-cluster/master/result.png)