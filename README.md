## Description
Colony Clicker is a React web application used to assist in MMEJ (microhomology-mediated end joining) research. It was built as a successor to Colony Counter, which attempted to automate the counting process entirely.

<img width="1792" alt="Screenshot 2023-03-19 at 12 27 19 AM" src="https://user-images.githubusercontent.com/20894826/226160835-95eae283-4a4e-4350-a5d6-065b635c1381.png">

*Image labelled with red numbers.*

## Basic usage
1. Go here: [Colony Clicker](https://al-exe.github.io/).
2. Upload a `png` or `jpg` file for labelling. 
3. Click anywhere within the image to create a label.
4. Screenshot your finished work, otherwise data will be lost.
5. Press `Discard image` in the right hand side to begin labelling the next image.

#### Usage tips
* To undo your last created label, press `ctrl + z` or `command + z`.
* Adjust your label settings (label type, color, size) in the right hand side.

## Limitations
This web application was developed within a very short time frame, so some limitations of its capabilities and usability had to be accepted.
#### **TLDR: It is highly advisable to use Colony Clicker in one browser window (using the entire screen) that will not be resized or refreshed.**

- **Image scaling:** The uploaded image cannot be resized or rescaled. Upon upload, the image will be scaled to the proportions of the browser window.
- **Image saving:** Image saving and writing is not supported. Users should simply screenshot the browser window if they would like to retain their work.
- **Window resizing:** The labeling functionality uses the absolute `(x, y)` coordinates of every click. Because of this, any changes to the browser window size or scale will cause the labels to be incorrectly offset.
- **Window refreshing:** Information about the uploaded image or labels will not be retained between refresh sessions.
- **Zooming in/out:** Native zooming is not supported. Mac users can still zoom in/out with trackpad gestures. It is not advisable to zoom in/out with the browser, as that will cause scaling issues mentioned in previous points.
