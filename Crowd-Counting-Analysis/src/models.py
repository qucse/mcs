#!/usr/bin/env python2
# -*- coding: utf-8 -*-


import torch
import torch.nn as nn
import torch.nn.functional as F
from src.network import Conv2d, FC


class CMTL(nn.Module):
    """
    Implementation of CNN-based Cascaded Multi-task Learning of High-level Prior and Density
    Estimation for Crowd Counting (Sindagi et al.)
    """

    def __init__(self, bn=False, num_classes=10):
        super(CMTL, self).__init__()

        self.num_classes = num_classes
        self.base_layer = nn.Sequential(Conv2d(1, 16, 9, same_padding=True, NL='prelu', bn=bn),
                                        Conv2d(16, 32, 7, same_padding=True, NL='prelu', bn=bn))

        self.hl_prior_1 = nn.Sequential(Conv2d(32, 16, 9, same_padding=True, NL='prelu', bn=bn),
                                        nn.MaxPool2d(2),
                                        Conv2d(16, 32, 7, same_padding=True, NL='prelu', bn=bn),
                                        nn.MaxPool2d(2),
                                        Conv2d(32, 16, 7, same_padding=True, NL='prelu', bn=bn),
                                        Conv2d(16, 8, 7, same_padding=True, NL='prelu', bn=bn))

        self.hl_prior_2 = nn.Sequential(nn.AdaptiveMaxPool2d((32, 32)),
                                        Conv2d(8, 4, 1, same_padding=True, NL='prelu', bn=bn))

        self.hl_prior_fc1 = FC(4 * 1024, 512, NL='prelu')
        self.hl_prior_fc2 = FC(512, 256, NL='prelu')
        self.hl_prior_fc3 = FC(256, self.num_classes, NL='prelu')

        self.de_stage_1 = nn.Sequential(Conv2d(32, 20, 7, same_padding=True, NL='prelu', bn=bn),
                                        nn.MaxPool2d(2),
                                        Conv2d(20, 40, 5, same_padding=True, NL='prelu', bn=bn),
                                        nn.MaxPool2d(2),
                                        Conv2d(40, 20, 5, same_padding=True, NL='prelu', bn=bn),
                                        Conv2d(20, 10, 5, same_padding=True, NL='prelu', bn=bn))

        self.de_stage_2 = nn.Sequential(Conv2d(18, 24, 3, same_padding=True, NL='prelu', bn=bn),
                                        Conv2d(24, 32, 3, same_padding=True, NL='prelu', bn=bn),
                                        nn.ConvTranspose2d(32, 16, 4, stride=2, padding=1, output_padding=0, bias=True),
                                        nn.PReLU(),
                                        nn.ConvTranspose2d(16, 8, 4, stride=2, padding=1, output_padding=0, bias=True),
                                        nn.PReLU(),
                                        Conv2d(8, 1, 1, same_padding=True, NL='relu', bn=bn))

    def forward(self, im_data):
        x_base = self.base_layer(im_data)
        x_hlp1 = self.hl_prior_1(x_base)
        x_hlp2 = self.hl_prior_2(x_hlp1)
        x_hlp2 = x_hlp2.view(x_hlp2.size()[0], -1)
        x_hlp = self.hl_prior_fc1(x_hlp2)
        x_hlp = F.dropout(x_hlp, training=self.training)
        x_hlp = self.hl_prior_fc2(x_hlp)
        x_hlp = F.dropout(x_hlp, training=self.training)
        x_cls = self.hl_prior_fc3(x_hlp)
        x_den = self.de_stage_1(x_base)
        x_den = torch.cat((x_hlp1, x_den), 1)
        x_den = self.de_stage_2(x_den)
        x_den_grid = nn.AvgPool2d(kernel_size=(192, 204))(x_den)*192*204
        return x_den, x_den_grid, x_cls
