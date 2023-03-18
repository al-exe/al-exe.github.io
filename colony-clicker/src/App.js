import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [markers, setMarkers] = useState([])
  const [imageFile, setImageFile] = useState(null)


  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick)
    }
  })


  useEffect(() => {
    let imageContainer = document.getElementById("imageContainer")
    if (!imageContainer) return
  
    const img = document.createElement("img");
    img.classList.add("obj");
    img.file = imageFile;

    img.style.width = "100%"
    img.style.height = "100%"

    imageContainer.appendChild(img);

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile])


  const handleClick = (event) => {
    let imageContainer = document.getElementById("imageContainer")
    if (!imageContainer) return

    let rect = imageContainer.getBoundingClientRect()

    if (withinBounds(
      event.x,
      event.y,
      rect.left,
      rect.right,
      rect.top,
      rect.bottom
    )) {
      setMarkers(markers => [...markers, {value: markers.length + 1, x: event.x, y: event.y}])
    }
  }


  const withinBounds = (x, y, left, right, top, bottom) => {
    return x < right && x > left && y > top && y < bottom
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
                height: 4,
                width: 4,
                backgroundColor: "#FFFF00"
              }}>
                {/* {m.value} */}
              </div>
            )
          })}
        </div>
      )
    }
  }


  return (
    <div className="App">
      {renderImageInput()}
      {renderImageClicker()}
    </div>
  );
}


export default App;
