import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import { useNavigate } from 'react-router-dom'

const PDFpage = () => {
  const [link, setLink] = useState("")
  const [subject2, setSubject2] = useState("")
  const [preheader2, setPreheader2] = useState("")
  const [isresponse, setResponse] = useState(false)
  const [countValue, setCountValue] = useState("")
  const [selectedOption, setSelectedOption] = useState<string>('mobileview');
  const navigate = useNavigate()

  const HandlePdf = () => {
    if (link == '') {
      alert('paste your email code')
      return;
    }

    let newLink = link
    newLink = newLink.replace(/%%\[[\s\S]*?\]%%/g, '');

    if (selectedOption == 'screenshot') {
      setResponse(true)
      axios.post(`${process.env.REACT_APP_SERVER_URL}/emailThumb`, {
        data: newLink,
        preheader2,
        subject2,
        // @ts-ignore
        mobileView: selectedOption == 'mobileview',
        screenshot: false,
      }, {
        responseType: 'json'
      })
        .then((response) => {
          // @ts-ignore
          if (response.status === 200 && selectedOption == 'screenshot') {
            const { desktop, mobile } = response.data;
            const desktopBlob = new Blob([Uint8Array.from(atob(desktop), c => c.charCodeAt(0))], { type: 'image/png' });
            const desktopLink = document.createElement('a');
            desktopLink.href = URL.createObjectURL(desktopBlob);
            desktopLink.download = 'desktop_screenshot.png';
            document.body.appendChild(desktopLink);
            desktopLink.click();
            document.body.removeChild(desktopLink);

            const mobileBlob = new Blob([Uint8Array.from(atob(mobile), c => c.charCodeAt(0))], { type: 'image/png' });
            const mobileLink = document.createElement('a');
            mobileLink.href = URL.createObjectURL(mobileBlob);
            mobileLink.download = 'mobile_screenshot.png';
            document.body.appendChild(mobileLink);
            mobileLink.click();
            document.body.removeChild(mobileLink);

            setResponse(false);
          }
        })
        .catch((err) => {
          console.error(err.response);
          setResponse(false)
        });
    };

    if (selectedOption == 'mobileview' || selectedOption == 'none') {
      setResponse(true)
      axios.post(`${process.env.REACT_APP_SERVER_URL}/pdfmaker`, {
        data: newLink,
        preheader2,
        subject2,
        // @ts-ignore
        mobileView: selectedOption == 'mobileview',
        screenshot: false,
      }, {
        responseType: 'arraybuffer'
      })
        .then((response) => {
          if (response.status === 200) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, 'output.pdf');
            axios.post(`${process.env.REACT_APP_SERVER_URL}/pdfcountInc`).then(((res) => { console.log(res.data) }))
            setResponse(false)
          } else {
            console.error('Response status is not 200');
          }
        })
        .catch((err) => {
          console.error(err.response);
          setResponse(false)
        });
    } else if (selectedOption == 'shaman') {
      setResponse(true)
      axios.post(`${process.env.REACT_APP_SERVER_URL}/pdfmaker`, {
        data: newLink,
        preheader2,
        subject2,
        mobileView: true,
        shaman: selectedOption == 'shaman',
      }, {
        responseType: 'arraybuffer'
      })
        .then((response) => {
          if (response.status === 200) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, 'output.pdf');
            axios.post(`${process.env.REACT_APP_SERVER_URL}/pdfcountInc`).then(((res) => { console.log(res.data) }))
            setResponse(false)
          } else {
            console.error('Response status is not 200');
          }
        })
        .catch((err) => {
          console.error(err.response);
          setResponse(false)
        });
    }
  }

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/pdfCount`)
      .then(res => {
        setCountValue(res.data.count)
      })
      .catch(err => {
        console.log(err.message)
      })
  }, [isresponse])

  return (
    <div>
      <div style={{ textAlign: "center" as const, display: "flex", justifyContent: "space-between" as const }}>
        <div>
          <button onClick={() => navigate("/")} style={{ width: "120px", color: "#000000", backgroundColor: "#ffffff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", position: "absolute" as const, right: 20, top: 10, padding: "6px 12px", cursor: "pointer" }}>Go to Home</button>

          <div style={{ display: "flex", justifyContent: "center" as const, alignItems: "center" as const, marginTop: "40px" }}>
            <div>
              <label style={{ cursor: 'pointer', fontWeight: 'bold', textTransform: "capitalize" as const }}>
                <input
                  type="radio"
                  value="mobileview"
                  checked={selectedOption === 'mobileview'}
                  onChange={() => setSelectedOption('mobileview')}
                />
                &nbsp;mass & veeva&nbsp;&nbsp;
              </label>
            </div>

            <div>
              <label style={{ cursor: 'pointer', fontWeight: 'bold', textTransform: "capitalize" as const }}>
                <input
                  type="radio"
                  value="shaman"
                  checked={selectedOption === 'shaman'}
                  onChange={() => setSelectedOption('shaman')}
                />
                &nbsp;shaman
              </label>
            </div>
          </div>
          
          <button 
            id='ThemeButtonSave' 
            onClick={HandlePdf} 
            disabled={isresponse}
            style={{ margin: "20px 0px", width: "40%", padding: "10px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {isresponse ? "Loading..." : "PDF"}
          </button>
          <br />

          <textarea 
            spellCheck={false} 
            value={subject2} 
            onChange={(e) => setSubject2(e.target.value)} 
            placeholder='Add Multiple subject lines' 
            style={{ width: "80%", marginTop: "5px", marginBottom: "5px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <textarea 
            spellCheck={false} 
            value={preheader2} 
            onChange={(e) => setPreheader2(e.target.value)} 
            placeholder='Add Multiple preHeaders' 
            style={{ width: "80%", marginTop: "5px", marginBottom: "5px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <textarea 
            spellCheck={false} 
            value={link} 
            onChange={(e) => setLink(e.target.value)} 
            placeholder='Enter Html Code from mass email or veeva html code you get from veeva vault in case you have multiple subject lines or preheaders just fill above input box else leave empty & ** try to minify and remove spaces in code for best results **' 
            style={{ width: "500px", height: "67vh", backgroundColor: "#333333", color: "#ffffff", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        
        <div>
          <div style={{ height: "13vh", textAlign: "left" as const, padding: "10px" }}>
            <span style={{ display: "inline-block", backgroundColor: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", margin: "2px" }}>
              Pdf's created so far with Tool <span style={{ color: "red" }}>{countValue}</span>
            </span>
            <br />
            <span style={{ display: "inline-block", backgroundColor: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", margin: "2px" }}>
              average Time taken to create pdf is 10min if its tool less than 1min
            </span>
            <br />
            <span style={{ display: "inline-block", backgroundColor: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", margin: "2px" }}>
              total Time saved <span style={{ color: "red" }}>{countValue ? Number(countValue) * 9 : 0}</span> mins
            </span>
          </div>
          <iframe
            srcDoc={link}
            width="730px"
            height="87%"
            title="email_preview"
            style={{
              border: "5px solid #e6e6e6", overflowX: "hidden" as const
            }}
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default PDFpage
