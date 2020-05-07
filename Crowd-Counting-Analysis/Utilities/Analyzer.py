import numpy as np
from PIL import Image, ImageDraw, ImageFont


def get_grid_count(img, rows, columns):
    """
    :param img: 2d array dense img to analyse
    :param columns: horizontal cut count
    :param rows: vertical cut count
    :return: 2d array of count in ach cutted segment
    """
    # TODO: Make splitting more accurate since some edge columns and rows might get missing
    data = np.array([[0]*columns]*rows)
    height, width= img.shape
    h_interval = height//rows
    w_interval = width//columns
    for r in range(rows):
        for c in range(columns):
            tmp = img[r*h_interval:(r+1)*h_interval, c*w_interval:(c+1)*w_interval]
            _sum = np.sum(tmp)
            data[r, c] = _sum
    return data


def get_grid_shaped_image(img, rows, columns):
    """
    :param img: 2d array dense img to analyse
    :param columns: horizontal cut count
    :param rows: vertical cut count
    :return: 2d array of count in ach cutted segment
    """
    height, width = img.shape
    img = Image.fromarray(img)
    drawn_img = ImageDraw.Draw(img)
    h_interval = height//rows
    w_interval = width//columns
    line_width = 10
    for r in range(rows-1):

        drawn_img.line((0, h_interval*(r+1), width, h_interval*(r+1)), fill=255, width=line_width)
    for c in range(columns-1):
        drawn_img.line((w_interval*(c+1), 0, w_interval*(c+1), height), fill=255, width=line_width)
    return np.array(img)


def get_grid_shaped_image_with_count(img, pred, rows, columns):
    """
    :param img: 2d array dense img to analyse
    :param columns: horizontal cut count
    :param rows: vertical cut count
    :return: 2d array of count in each cutted segment
    """
    height, width = img.shape
    tmp_img = Image.fromarray(np.array(img))
    drawn_img = ImageDraw.Draw(tmp_img)
    h_interval = height//rows
    w_interval = width//columns
    line_width = 10
    for r in range(rows-1):
        drawn_img.line((0, h_interval*(r+1), width, h_interval*(r+1)), fill=255, width=line_width)
    for c in range(columns-1):
        drawn_img.line((w_interval*(c+1), 0, w_interval*(c+1), height), fill=255, width=line_width)

    cells_tl_vertices = []
    counts = get_grid_count(pred, rows, columns)
    for r in range(rows):
        for c in range(columns):
            coordinates = (c * w_interval, r * h_interval)
            cells_tl_vertices.append(coordinates)
            centered_coordinates = np.array(np.array(coordinates) + np.array((h_interval // 2.5, w_interval // 2.5)))
            font = ImageFont.truetype('fonts/Aaargh.ttf', 90)
            drawn_img.text(centered_coordinates, str(counts[r, c]), fill=255, font=font)

    return np.array(tmp_img)
