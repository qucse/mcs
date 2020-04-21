from datetime import datetime
import json
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

file_name = 'D:/Qu Y4S2/senior/mcssp/busConvert/simulation/output.csv'
file = open(file_name , 'r')
file.readline() # remove header
lines = file.readlines()
session = requests.Session()
retry = Retry(connect=3, backoff_factor=0.5)
adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)
for line in lines:
    splited = line.split(',')
    date = splited[1].split('/')
    houre = splited[2].split(' ')[0].split(':')
    time = datetime(int(date[2]) , int(date[0]) , int(date[1]) , hour=int(houre[0]) ,minute=int(houre[1]) , second=int(houre[2])).ctime()
    json_data ={'id' : int(float(splited[0]) * 100) , 'time' : time , 'bearing' : 0 , "speed" : float(splited[6]) , "altitude" : 0 , "accuracy" : 100 ,
     "longitude" : float(splited[3]) , "latitude" : float(splited[4]) , "provider": "manual creation"}
    # print(json_data)
    session.post('http://localhost:1504/api/geoinfo' , json = json_data)
