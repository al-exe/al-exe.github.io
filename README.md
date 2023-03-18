## Description
Colony Clicker is a React web application to assist in MMEJ (Microhomology-mediated end joining) research.

## Basic usage
1. Go here: [Colony Clicker](https://al-exe.github.io/)
2. Upload an image that you need to label.
3. Click anywhere within the image container to create labels.
4. Press `Discard image` in the right hand side column when you are finished.

#### Usage tips
* To undo your last created label, press `ctrl + z` or `command + z`.
* Adjust your label settings (label type, color, size) to suit your preferences in the right hand side column.

## Limitations
This web application was developed within a very short timeframe, so some limitations to its capabilities and usability had to be accepted.
#### **TLDR: It is highly advisable to use Colony Clicker in one browser window (using the entire screen) that will not be resized or refreshed later.**

- **Image scaling:** The uploaded image cannot be resized or rescaled. Upon upload, the image will be scaled to the proportions of the browser window.
- **Image saving:** Colony Clicker does not support image writing or saving at this time. Users should simply screenshot the browser window if they would like to retain information.
- **Window resizing:** The labeling functionality uses the absolute `(x, y)` coordinates of every click. Because of this, any changes to the browser window size or scale will cause the labels to be incorrectly offset.
- **Window refreshing:** Information about the uploaded image or labels will not be retained between refresh sessions.
