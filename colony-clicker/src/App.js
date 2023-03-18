import './App.css';
import { useState, useEffect } from 'react';
import ImageContainer from './ImageContainer';

function App() {
  const [uploaded, setUploaded]   = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [markers, setMarkers]     = useState([])

  // init listeners
  useEffect(() => {
    window.addEventListener("click", handleClick)
    window.addEventListener("keydown", handleKeydown)

    return () => {
      window.removeEventListener("click", handleClick)
      window.removeEventListener("keydown", handleKeydown)
    }
  })

  // create img element when user inputs an image file
  useEffect(() => {
    let imageContainer = document.getElementById("imageContainer")
    if (!imageContainer || uploaded) return

    const img = document.createElement("img");
    img.classList.add("obj");
    img.file = imageFile;
    setUploaded(true)

    // setup img styles
    img.style.width = "100%"
    img.style.height = "100%"
    img.style.borderRadius = "16px"

    imageContainer.appendChild(img)

    const reader = new FileReader()
    reader.onload = (event) => {
      img.src = event.target.result;
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // creates a marker on the click location
  const handleClick = (event) => {
    let imageContainer = document.getElementById("imageContainer")
    if (!imageContainer) return

    let rect = imageContainer.getBoundingClientRect()
    if (_withinBounds(
      event.x,
      event.y,
      rect.left,
      rect.right,
      rect.top,
      rect.bottom
    )) {
      setMarkers(markers => [
        ...markers,
        {
          value: markers.length + 1,
          x: event.layerX,
          y: event.layerY
        }
      ])
    }
  }

  // undoes the last marker
  const handleKeydown = (event) => {
    // ctrl or command + z
    if (event.keyCode === 90 && (event.ctrlKey || event.metaKey)) {
      if (markers.length === 0) return
      setMarkers(markers.slice(0, -1));
    }
  }

  const _withinBounds = (
    x, y, left, right, top, bottom
  ) => {
    return (
      x < right &&
      x > left &&
      y > top &&
      y < bottom
    )
  }

  const renderTopBanner = () => {
    return (
      <div className="TopBanner">
        <div className="TopBanner-title">
          Colony Clicker
        </div>
        <div className="TopBanner-info">
          by @al-exe
        </div>
      </div>
    )
  }

  const renderImageInput = () => {
    if (imageFile) return
    return (
      <input
        id="imageFileInput"
        type="file"
        name="avatar"
        accept="image/png, image/jpeg"
        onChange={(event) => setImageFile(event.target.files[0])}
      />
    )
  }

  const renderImageClicker = () => {
    if (imageFile) {
      return (
        <div id="imageContainer" className="App-imageContainer">
          {markers.map((m, index) => {
            return (
              <div style={{
                position: "absolute",
                top: m.y,
                left: m.x,
                color: "#FFFFFF",
                // height: 4,
                // width: 4,
                // backgroundColor: "#FFFF00"
              }}>
                {m.value}
              </div>
            )
          })}
        </div>
      )
    }
  }

  return (
    <div className="App">
      {renderTopBanner()}
      <div className="Body">
        <div className="Body-imageContainer">
          {renderImageInput()}
          {renderImageClicker()}
        </div>
        <div className="Body-infoColumn">
          {imageFile ?
            "#TODO: options and data go here."
            :
            "Please upload an image."
          }
        </div>
      </div>
    </div>
  )
}

export default App;
