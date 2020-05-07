import numpy as np


def gen_random_grid(size=(4, 5), max_num=5):
    return np.random.randint(max_num, size=size)


def get_insights(grids):
    pass


def add_movement(g, direction, magnitude):
    """
    This function takes a grid/matrix and add the magnitude change to values of specific cells depending on the direction
    :param g: 2D list of numbers
    :param direction: int; 0:left, 1:top, 2:right, 3:bottom
    :param magnitude: magnitude of people change in the specified direction
    :return:
    """
    # Specifying what subset to work on
    if direction == 0:
        # grid = np.asarray(g[:, 0])
        grid = g[:, 0]
    elif direction == 1:
        # grid = np.asarray(g[0, 1:-1])
        grid = g[0, 1:-1]
    elif direction == 2:
        # grid = np.asarray(g[:, -1])
        grid = g[:, -1]
    elif direction == 3:
        # grid = np.asarray(g[-1, 1:-1])
        grid = g[-1, 1:-1]
    else:
        grid = None

    # Specifying avg amount to be added & correcting it if not valid
    subset_size = len(grid)
    if np.sum(grid) + magnitude < 0:
        magnitude = -1 * np.sum(grid)
    avg_to_add = magnitude / subset_size

    # Ordering subset decreasingly in case of -ve magnitude to be deducted to deduct from the smallest first
    dictionary = {}
    for i in range(len(grid)):
        dictionary.update({i: grid[i]})
    tuples = np.array(sorted(list(dictionary.items()), key=lambda kv: (kv[1], kv[0])))

    # Doing the math
    for i in tuples[:, 0]:
        i = int(i)
        if grid[i] + avg_to_add < 0:
            magnitude += grid[i]
            grid[i] = 0
            avg_to_add = magnitude / (subset_size - i)
        else:
            grid[i] += avg_to_add
            mag_sign = np.sign(magnitude)
            magnitude -= mag_sign * avg_to_add

    return g


def make_sequence(length=10, bounds=1):
    sequences = []
    movement = [0, 0, 0, 0]

    starting_grid = gen_random_grid()
    sequences.append(starting_grid)
    for i in range(length - 1):
        i += 1
        l_mov, t_mov, r_mov, b_mov = np.random.randint(-bounds, bounds + 1), np.random.randint(-bounds, bounds + 1), \
                                     np.random.randint(-bounds, bounds + 1), np.random.randint(-bounds, bounds + 1)
        starting_grid = add_movement(starting_grid, 0, l_mov)
        starting_grid = add_movement(starting_grid, 1, t_mov)
        starting_grid = add_movement(starting_grid, 2, r_mov)
        starting_grid = add_movement(starting_grid, 3, b_mov)

        movement = list(map(lambda x, y: x + y, movement, [l_mov, t_mov, r_mov, b_mov]))

        sequences.append(np.array(starting_grid))

    return np.array(sequences), movement


def gen_sequences(count, save=True, f_seq_name="./AnalysisModel/sequences", f_mov_name="./AnalysisModel/movements"):
    sequences = []
    movements = []
    for i in range(count):
        sequence, movement = make_sequence()
        sequences.append(sequence)
        movements.append(movement)
    if save:
        np.save(f_seq_name, sequences, allow_pickle=True)
        np.save(f_mov_name, movements, allow_pickle=True)


def get_sequences_movements(f_seq_name="./AnalysisModel/sequences.npy", f_mov_name="./AnalysisModel/movements.npy"):
    return np.load(f_seq_name), np.load(f_mov_name)