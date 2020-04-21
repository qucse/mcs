import torch
from API import API

import test
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from Utilities import Analyzer
from src.data_loader import get_img_data
import math
from Analysis import Data_set_generator
from AnalysisModel import model
import cv2
import time


def plot_mult(imgs, title=""):
    r = math.floor(math.sqrt(len(imgs)))
    c = math.ceil(len(imgs) / r)
    # start = int(str(r) + str(c))*10
    for i in range(len(imgs)):
        img = imgs[i]
        i += 1
        plt.subplot(r, c, i)
        plt.imshow(img)
    return plt.show()


def im_normalize(im):
    return im * 255 / np.max(im)


def test_pred():
    root = './data/original/shanghaitech/part_B_final/test_data'
    imgs_path = root + '/images/'
    gt_path = root + '/ground_truth_csv/'
    fname = 'IMG_72.jpg'

    img, gt, gt_count = get_img_data(imgs_path, gt_path, fname, gt_downsample=False)

    print(img, img.shape)
    pred, gridded_pred = test.test_single_image(img)
    print(gridded_pred)
    img, gt = img[0, 0], gt[0, 0]

    pred_count = np.sum(gridded_pred)

    analyzed_count_data = Analyzer.get_grid_count(pred, 4, 5)
    gridded_image = Analyzer.get_grid_shaped_image(img, 4, 5)
    gridded_image_count = Analyzer.get_grid_shaped_image_with_count(img, pred, 4, 5)

    print(np.matrix(analyzed_count_data))
    print("Actual count = {}\nPredicted = {}".format(gt_count, pred_count))

    plot_mult([img, pred, gridded_image_count, analyzed_count_data, gridded_pred])
    # plot_mult([img, gridded_image, gridded_image_count])
    # plot_mult([Analyzer.get_grid_shaped_image(im_normalize(pred), 4, 5),
    #            Analyzer.get_grid_shaped_image_with_count(im_normalize(pred), pred, 4, 5),
    #            analyzed_count_data])


def test_data_gen():
    Data_set_generator.gen_sequences(1000, save=True)
    sequences, movements = Data_set_generator.get_sequences_movements()
    print("Generated dataset")
    sfa_model = model.BCP()
    sfa_model.to(sfa_model.device)
    model.train(sfa_model, sequences, movements, epochs=10)
    sfa_model.save()


def plt_to_image(img):
    return plt.imshow(img).make_image("agg", unsampled=True)[0][:, :, :3]


def main():
    api = API()
    print("[INFO] camera sensor warming up...")
    vs = cv2.VideoCapture("train.mp4")  # get input from file

    init_time = time.time()
    current_time = init_time
    last_count = 0
    total_in_waiting_passengers = 0
    total_time_spent = 0
    top_count_on_bus_arrival, top_count_on_bus_departure = 0, 0

    bus_in_station = False
    bus_was_in = False

    i = 0
    last_frames_counts = []
    last_top_frames_counts = []
    frames_to_skip = 9
    average_waiting_time = 0
    net_flow_into_bus = 0

    while True:
        _, very_original_frame = vs.read()
        if i % (1 + frames_to_skip) != 0:
            i += 1
            continue
        i += 1

        original_frame = cv2.cvtColor(very_original_frame, cv2.COLOR_BGR2GRAY)
        frame = np.expand_dims(original_frame, axis=0)
        frame = np.expand_dims(frame, axis=0)
        prev_time = current_time
        current_time = time.time()
        pred, gridded_pred = test.test_single_image(frame)
        top_grid_count = gridded_pred[1, 1:-1][0]
        count = np.sum(pred)
        last_frames_counts.append(count)
        last_top_frames_counts.append(top_grid_count)

        if i > 5 * (frames_to_skip + 1) and abs(count - last_frames_counts[-3]) / last_frames_counts[- 3] > 0.15:
            bus_in_station = True

        # if bus_in_station and not bus_was_in:
        #     top_count_on_bus_arrival = top_grid_count
        # elif not bus_in_station and bus_was_in:
        #     top_count_on_bus_departure = top_grid_count

        if bus_in_station:
            init_time = time.time()
            current_time = init_time
            last_count = 0
            total_in_waiting_passengers = 0
            total_time_spent = 0
            net_flow_into_bus += abs(last_top_frames_counts[-1] - last_top_frames_counts[-2])
        else:
            diff = count - last_count
            last_count = count
            total_in_waiting_passengers += diff
            total_time_spent += (current_time - prev_time) * diff

        average_waiting_time += (total_time_spent / (total_in_waiting_passengers if total_in_waiting_passengers > 0 else math.inf))

        data_dict = {"Average Wait Time": average_waiting_time,
                     "Current Count": count,
                     "Top Grid Count": top_grid_count,
                     "Net flow into bus": -net_flow_into_bus,
                     # "Net flow into bus": top_count_on_bus_departure - top_count_on_bus_arrival,
                     "Bus in station": bus_in_station}

        # api.broadcast(data_dict)
        print(data_dict, "\n====================")
        first_column = cv2.vconcat([plt_to_image(pred), very_original_frame])
        final = plt_to_image(cv2.hconcat([first_column]))
        print(np.array(first_column).shape)
        cv2.putText(first_column, f"Bus In Station = {bus_in_station}", (0, 550), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (255, 20, 20), 2, cv2.LINE_AA)
        cv2.putText(first_column, f"Total count = {count}", (500, 550), cv2.FONT_HERSHEY_SIMPLEX, 1, (20, 255, 20), 2,
                    cv2.LINE_AA)

        cv2.imshow("Frame", first_column)

        key = cv2.waitKey(1) & 0xFF

        bus_was_in = bus_in_station

        if key == ord("q"):
            break
        # if key == ord("b"):
        #     bus_in_station = True
        # else:
        #     bus_in_station = False


main()
# test_pred()
