import './App.css';
import { useState, useEffect } from 'react';

function ImageContainer(props) {

  const renderImageInput = () => {
    if (props.imageFile) return
    return (
      <input
        id="imageFileInput"
        type="file"
        name="avatar"
        accept="image/png, image/jpeg"
        onChange={(event) => props.setImageFile(event.target.files[0])}
      />
    )
  }


  // const renderImageClicker = () => {
  //   if (props.imageFile) {
  //     return (
  //       <div id="imageContainer" className="App-imageContainer">
  //         {markers.map((m, index) => {
  //           return (
  //             <div style={{
  //               position: "absolute",
  //               top: m.y,
  //               left: m.x,
  //               color: "#FFFFFF",
  //               // height: 4,
  //               // width: 4,
  //               // backgroundColor: "#FFFF00"
  //             }}>
  //               {m.value}
  //             </div>
  //           )
  //         })}
  //       </div>
  //     )
  //   }
  // }


  return (
    <div className="ImageGUI">
      {renderImageInput()}
      {props.renderImageClicker()}
    </div>
  );
}

export default ImageContainer;
