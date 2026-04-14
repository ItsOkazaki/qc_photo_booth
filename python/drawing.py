import cv2
import numpy as np

class Canvas:
    def __init__(self, width, height):
        self.img_canvas = np.zeros((height, width, 3), np.uint8)
        self.xp, self.yp = 0, 0
        self.brush_thickness = 15
        self.eraser_thickness = 100
        self.draw_color = (255, 0, 255)

    def draw(self, img, lm_list, fingers):
        if fingers[1] == 1 and fingers[2] == 0:
            x1, y1 = lm_list[8][1:]
            cv2.circle(img, (x1, y1), 15, self.draw_color, cv2.FILLED)
            
            if self.xp == 0 and self.yp == 0:
                self.xp, self.yp = x1, y1

            cv2.line(self.img_canvas, (self.xp, self.yp), (x1, y1), self.draw_color, self.brush_thickness)
            self.xp, self.yp = x1, y1
        else:
            self.xp, self.yp = 0, 0

    def clear(self):
        self.img_canvas = np.zeros_like(self.img_canvas)

    def get_combined(self, img):
        img_gray = cv2.cvtColor(self.img_canvas, cv2.COLOR_BGR2GRAY)
        _, img_inv = cv2.threshold(img_gray, 50, 255, cv2.THRESH_BINARY_INV)
        img_inv = cv2.cvtColor(img_inv, cv2.COLOR_GRAY2BGR)
        img = cv2.bitwise_and(img, img_inv)
        img = cv2.bitwise_or(img, self.img_canvas)
        return img
