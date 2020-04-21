import os
import torch
import numpy as np
from src.crowd_count import CrowdCounter
from src import network
from src.data_loader import ImageDataLoader
from src import utils
from PIL import Image

torch.backends.cudnn.enabled = True
torch.backends.cudnn.benchmark = False
vis = False
save_output = True

# test data and model file path
data_path = './data/original/shanghaitech/part_A_final/test_data/images/'
gt_path = './data/original/shanghaitech/part_A_final/test_data/ground_truth_csv/'
model_path_1 = './final_models/cmtl_shtechA_204.h5'
model_path_2 = './final_models/cmtl_shtechB_768.h5'
model_path_3 = './saved_models/cmtl_shtechA_218.h5'
best_model_path = './saved_models/cmtl_shtechA_116.h5'

output_dir = './output/'
model_name = os.path.basename(model_path_1).split('.')[0]
file_results = os.path.join(output_dir, 'results_' + model_name + '_.txt')
if not os.path.exists(output_dir):
    os.mkdir(output_dir)

output_dir = os.path.join(output_dir, 'density_maps_' + model_name)
if not os.path.exists(output_dir):
    os.mkdir(output_dir)

net = CrowdCounter()
trained_model = os.path.join(best_model_path)
network.load_net(trained_model, net)
net.cuda()
net.eval()


def test_single_image(img):
    output = net(img)
    density_map = output[0][0][0].data.cpu().numpy()
    gridded_density_map = output[1][0][0].data.cpu().numpy()

    return density_map, gridded_density_map


def test_multiple(imgs):
    maps = []
    for img in imgs:
        (dm, gdm) = test_single_image(img)
        maps.append((dm, gdm))
    return maps


def test_all():
    # load test data
    data_loader = ImageDataLoader(data_path, gt_path, shuffle=False, gt_downsample=True, pre_load=True)

    net = CrowdCounter()

    trained_model = os.path.join(model_path_1)
    network.load_net(trained_model, net)
    net.cuda()
    net.eval()
    mae = 0.0
    mse = 0.0
    for blob in data_loader:
        im_data = blob['data']
        gt_data = blob['gt_density']
        density_map = net(im_data, gt_data)
        # density_map = density_map.data.cpu().numpy()
        density_map = density_map[0].cpu().detach().numpy()
        gt_count = np.sum(gt_data)
        et_count = np.sum(density_map)
        mae += abs(gt_count - et_count)
        mse += ((gt_count - et_count) * (gt_count - et_count))
        if vis:
            utils.display_results(im_data, gt_data, density_map)
        if save_output:
            utils.save_density_map(density_map, output_dir,
                                   'output_' + blob['fname'].split('.')[0] + '.png')

    mae = mae / data_loader.get_num_samples()
    mse = np.sqrt(mse / data_loader.get_num_samples())
    print('MAE: %0.2f, MSE: %0.2f' % (mae, mse))

    f = open(file_results, 'w')
    f.write('MAE: %0.2f, MSE: %0.2f' % (mae, mse))
    f.close()

# test_all()