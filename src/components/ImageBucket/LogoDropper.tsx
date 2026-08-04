import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import dropIcon from '../Logo/droper.jpg';
import "./ImageDropper.css";
import axios from 'axios';

function LogoDropper({ onClose }: { onClose: () => void }) {
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setUploading] = useState(false)

  const handleLogoDropper = (acceptedFiles: any[]) => {
    for (let i = 0; i < acceptedFiles.length; i++) {
      let img = acceptedFiles[i]
      if (img.path.split(".")[1].toLowerCase() == "png" || img.path.split(".")[1].toLowerCase() == "jpg" || img.path.split(".")[1].toLowerCase() == "jpeg" || img.path.split(".")[1].toLowerCase() == "gif") {
      } else {
        alert("wrong formate please upload only images of png or jpg")
        return;
      }
    }
    setImages(acceptedFiles);
  };

  const uploadImages = () => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`my-image-file`, image);
    });

    setUploading(true)
    axios.post(`${process.env.REACT_APP_SERVER_URL}/logos-gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((res) => {
        setUploading(false)
        alert(res.data.message)
        onClose()
      })
      .catch((err) => {
        setUploading(false)
        alert("upload failed")
      });
  };

  return (
    <div>
      <span className="upload-badge" style={{ display: "inline-block", padding: "2px 8px", backgroundColor: "#fed7d7", color: "#c53030", borderRadius: "4px", fontSize: "12px", marginBottom: "8px" }}>
        *Max 10 Logos in one Go
      </span>
      <Dropzone onDrop={handleLogoDropper} multiple={true}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', height: "500px", width: "100%", backgroundColor: "#f3f3f3" }}>
              <img src={dropIcon} alt="upload-btn" width={'300px'} height={'300px'} />
            </div>
          </div>
        )}
      </Dropzone>
      <button
        onClick={uploadImages}
        disabled={isUploading}
        id='ThemeButtonSave'
        style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? "not-allowed" : "pointer" }}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {images.length > 0 && (
        <div>
          <p>Selected Images:</p>
          <div className="image-container">
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <div style={{ border: "1px solid red" }}>
                  <img src={URL.createObjectURL(image)} alt={`Selected ${index}`} width={"200px"} height={"200px"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LogoDropper;
