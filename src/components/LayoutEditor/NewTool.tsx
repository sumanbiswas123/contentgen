import React, { useState } from 'react'
import axios from 'axios'

const NewTool = () => {
  const [isOpen, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [usename, setUsername] = useState(sessionStorage.getItem("username") || "")

  const onClose = () => setOpen(false)
  const onOpen = () => {
    window.open(`https://10.215.36.181:5000?username=${usename}`, "_blank")
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let validationName = file.name.split(".")
    if (validationName[1] !== "zip") {
      alert("please select zip file")
    } else {
      setSelectedFile(file);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("No File Selected")
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post('UPLOAD_API_ENDPOINT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <button onClick={onOpen} className="MenuButtons">Update Request</button>

      {isOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", width: "500px", maxWidth: "90%", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0 }}>Upload Html zip File</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <div style={{ padding: "20px" }}>
              <form onSubmit={handleFormSubmit}>
                <label>
                  Select File:
                  <input type="file" onChange={handleFileChange} />
                </label>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  style={{ marginTop: "50px", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "4px", padding: "8px 16px", cursor: !selectedFile ? "not-allowed" : "pointer", opacity: !selectedFile ? 0.6 : 1 }}
                >
                  Upload
                </button>
              </form>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eee" }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewTool