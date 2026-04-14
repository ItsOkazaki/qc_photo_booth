import cv2
import numpy as np

def calculate_distance(p1, p2):
    """Calculate Euclidean distance between two points."""
    return np.hypot(p2[0] - p1[0], p2[1] - p1[1])

def rescale_frame(frame, percent=75):
    """Rescale a frame to a certain percentage."""
    width = int(frame.shape[1] * percent / 100)
    height = int(frame.shape[0] * percent / 100)
    dim = (width, height)
    return cv2.resize(frame, dim, interpolation=cv2.INTER_AREA)
