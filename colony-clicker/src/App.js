import './App.css';
import { useState, useEffect } from 'react';
import ImageContainer from './ImageContainer';

function App() {
  const [imageFile, setImageFile] = useState(null)

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


  return (
    <div className="App">
      {renderTopBanner()}
      <div className="Body">
        <div className="Body-imageContainer">
          <ImageContainer />
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
  );
}

export default App;
