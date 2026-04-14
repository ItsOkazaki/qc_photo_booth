import numpy as np

def detect_gesture(fingers, lm_list):
    """
    Gestures:
    - [1, 1, 1, 1, 1] = Open Hand (Clear)
    - [0, 1, 1, 0, 0] = V-Sign (Change Filter)
    - [1, 0, 0, 0, 0] = Thumbs Up (Take Photo)
    - Pinch = Selection (Handled in main loop via distance)
    """
    if fingers == [1, 1, 1, 1, 1]:
        return "CLEAR"
    elif fingers == [0, 1, 1, 0, 0]:
        return "FILTER"
    elif fingers == [1, 0, 0, 0, 0]:
        return "PHOTO"
    
    # Pinch detection (Index and Thumb tips close)
    if len(lm_list) != 0:
        x1, y1 = lm_list[4][1], lm_list[4][2]
        x2, y2 = lm_list[8][1], lm_list[8][2]
        length = np.hypot(x2 - x1, y2 - y1)
        if length < 30:
            return "PINCH"
            
    return "NONE"
