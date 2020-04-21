from threading import Thread
import requests
import random


class API:
    def __init__(self, threads=100, recv_host="http://127.0.0.1:3000"):
        self.threads = threads
        self.recv_ip = recv_host

    def _post(self, data, bus_station_id):
        header = {'content-type': 'application/json', 'bus_station_ID': str(bus_station_id)}
        request = requests.post(self.recv_ip, data=data, headers=header)
        print(f"Sent data of bus station {bus_station_id} with status code {request.status_code}")
        pass

    def broadcast(self, data):
        threads = []

        for i in range(self.threads):
            if i != 0:  # Modify data as if it's different stations
                data["Current Count:"] *= (random.random()+0.5)
                data["Top Grid Count:"] *= (random.random()+0.5)
                data["Average Wait Time:"] *= (random.random()+0.5)
                data["Net flow into bus:"] *= (random.random()+0.5)
                data["Bus in station:"] = True if random.random > 0.5 else False

            thread = Thread(target=self._post, args=(data, i))
            threads.append(thread)
            thread.start()

        for t in threads:
            t.join()
