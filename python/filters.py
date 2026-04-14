import cv2
import numpy as np

def apply_algerian_filter(img):
    h, w, _ = img.shape
    overlay = img.copy()
    # Green left, White right, Red crescent/star (simplified as overlay)
    cv2.rectangle(overlay, (0, 0), (w//2, h), (0, 102, 0), -1)
    return cv2.addWeighted(overlay, 0.3, img, 0.7, 0)

def apply_science_filter(img):
    # Add some formulas or symbols
    cv2.putText(img, "E = mc^2", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(img, "H2O", (w-150, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    return img

def apply_future_filter(img):
    # Cyberpunk style (cyan/magenta)
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    img_hsv[:,:,0] = (img_hsv[:,:,0] + 90) % 180
    return cv2.cvtColor(img_hsv, cv2.COLOR_HSV2BGR)

class FilterManager:
    def __init__(self):
        self.filters = ["None", "Algeria", "Science", "Future"]
        self.current_index = 0

    def next_filter(self):
        self.current_index = (self.current_index + 1) % len(self.filters)

    def apply(self, img):
        f = self.filters[self.current_index]
        if f == "Algeria": return apply_algerian_filter(img)
        if f == "Science": return apply_science_filter(img)
        if f == "Future": return apply_future_filter(img)
        return img
