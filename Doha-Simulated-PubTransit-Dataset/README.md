# Doha simulated public Transportation Dataset
the output dataset for Doha public Transportation simulation is in this folder
the dataset was generated using SUMO and GTFS data of Qatar public Transportation network obtained from Mowasalat Qatar using the following procedure :
1- extract the bus stops location from GTFS data using stops.py script in busConvert folder
2- generate the bus trips information using routes.py script in busConvert folder
3- generate the route for the generated trips using DUAROUTER SUMO's script
4- build the simulation configuration file
5- run the simulation and store the output in FCD format
6- convert FCD format to txt format using traceExporter SUMO's script
7- load the txt output to csv file

the simulation contain 3 object types :
 1- persons (id formatted as Person_flowId.number) for example (person_193.0) where 193 represents the id of the person's flow , and 0 is the person id inside that flow
 2- cars (id formatted as car_id)
 3- bus (id formatted as shapeID.number) for example bus that follows shape 110 for route 11 will have id of 110.busID , and if the id in the bus flow is zero it will be omitted (110) ,
 if not it will be displayed (110.1)

the data set contains 4 fields :
id : object id
time : time stamp for the object movement
longitude : longitude of the object movement in the following format (month/day/year  hour:minute:seconds AM/PM)
latitude : latitude of the object movement
speed : object speed in km/h
