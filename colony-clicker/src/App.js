import './App.css';
import { useState, useEffect } from 'react';
import ImageContainer from './ImageContainer';

function App() {
  // marker color options
  const colors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
    "#000000",
    "#FFFFFF",
  ]

  // marker type options
  const labelTypes = [
    "numbers",
    "dots"
  ]

  // data state
  const [uploaded, setUploaded]   = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [markers, setMarkers]     = useState([])

  // settings state
  const [markerColor, setMarkerColor] = useState("#FF0000")
  const [markerType, setMarkerType]   = useState("numbers")
  const [markerSize, setMarkerSize]   = useState(16)

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
    img.style.borderRadius = "8px"

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
      event.preventDefault() // prevents undoing the size input
      if (markers.length === 0) return
      setMarkers(markers.slice(0, -1));
    }
  }

  const handleClearLabels = () => {
    setMarkers([])
  }

  // discards image and resets state
  const handleRestart = () => {
    setUploaded(false)
    setImageFile(null)
    setMarkers([])
  }

  const handleSizeFont = (size) => {
    let sizeNumber = Number(size)
    if (typeof(sizeNumber) === "number") {
      if (sizeNumber > 48) sizeNumber = 48
      if (sizeNumber < 2) sizeNumber = 2
      setMarkerSize(sizeNumber)
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

            if (markerType === "numbers") {
              return (
                <div
                  style={{
                    position: "absolute",
                    top: m.y,
                    left: m.x,
                    color: markerColor,
                    fontSize: markerSize
                  }}
                >
                  {m.value}
                </div>
              )
            } else if (markerType === "dots") {
              return (
                <div
                  style={{
                    position: "absolute",
                    top: m.y,
                    left: m.x,
                    height: markerSize,
                    width: markerSize,
                    borderRadius: markerSize / 2,
                    backgroundColor: markerColor
                  }}
                />
              )
            }
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
            <div className="InfoColumn">
              <div className="InfoColumn-section">
                <div className="InfoColumn-sectionTitle">
                  General
                </div>
                <div className="InfoColumn-title">
                  {`File: ${imageFile.name}`}
                </div>
                <div className="InfoColumn-discardButton" onClick={handleClearLabels}>
                  Clear labels
                </div>
                <div className="InfoColumn-discardButton" onClick={handleRestart}>
                  Discard image
                </div>
              </div>

              <div className="InfoColumn-section">
                <div className="InfoColumn-sectionTitle">Settings</div>

                <div className="InfoColumn-settingsRow">
                  <div>Label size</div>
                  <input
                    className="InfoColumn-size"
                    defaultValue={markerSize}
                    onChange={(event) => handleSizeFont(event.target.value)}
                  />
                </div>

                <div className="InfoColumn-settings">
                  <div>Label type</div>
                  <div className="InfoColumn-optionsRow">
                    {labelTypes.map((label) => {
                      return (
                        <div 
                          className={label === markerType ?
                            "InfoColumn-typeOptionSelected" : "InfoColumn-typeOption"
                          }
                          onClick={() => setMarkerType(label)}
                        >
                          {label}
                        </div>
                      )
                    })}
                  </div>
                </div>


                <div className="InfoColumn-settings">
                  <div>
                    Label color
                  </div>
                  <div className="InfoColumn-optionsRow">
                    {colors.map((c) => {
                      return (
                        <div
                          className="InfoColumn-option"
                          style={{backgroundColor: c}}
                          onClick={() => setMarkerColor(c)}
                        >
                          <div className="optionSelected" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="InfoColumn-section">
                <div className="InfoColumn-sectionTitle" style={{color: "#f2a918"}}>
                  {`Count: ${markers.length}`}
                </div>
              </div>
            </div>
            :
            "Please upload an image."
          }
        </div>
      </div>
    </div>
  )
}

export default App;
