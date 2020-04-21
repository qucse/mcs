import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import optim
import numpy as np

from src.network import Conv2d, FC


class BCP(nn.Module):
    """
    Implementation of Bus station Count Predictor
    """

    def __init__(self, bn=False, num_classes=10):
        super(BCP, self).__init__()
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.fc1 = nn.Linear(10 * 4 * 5, 400)
        self.fc2 = nn.Linear(400, 200)
        self.fc3 = nn.Linear(200, 4)

    def forward(self, x):
        x = torch.tensor(x).to(self.device)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return F.relu(x)

    def save(self, f_name="SFA"):
        torch.save(self.state_dict(), f_name)


def __get_accuracy(pred, true):
    acc = 0
    for i in range(len(pred)):
        if true[i] == 0:
            continue
        else:
            acc += (np.abs(pred[i] - true[i]) / true[i]) / len(pred)
    return 1 - acc


def train(model, sequences, movements, epochs=2, keep_saving=True):
    optimizer = optim.Adam(model.parameters(), lr=0.1)
    criterion = nn.L1Loss()
    logging_interval = 500
    total_loss = 0
    # run the main training loop
    for epoch in range(epochs):
        for i in range(len(sequences)):
            input_data, target = sequences[i], movements[i]
            input_data = torch.as_tensor(input_data, dtype=torch.float).flatten(0, 2)
            target = torch.as_tensor(target, dtype=torch.float)

            max_num = torch.max(input_data)
            input_data /= max_num
            target /= max_num

            optimizer.zero_grad()
            net_out = model(input_data)
            # print(net_out, target)
            # print(net_out.shape, target.shape)
            accuracy = __get_accuracy(torch.tensor(net_out).detach().cpu().numpy(), target)
            loss = criterion(net_out, target.to(model.device))
            total_loss += loss.data
            loss.backward()
            optimizer.step()
            if i % logging_interval == 0:
                if keep_saving:
                    model.save()
                print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}\tAccuracy: {:.6f}'.format(
                    epoch, i, len(sequences), 100. * i / len(sequences), loss.data, accuracy))
