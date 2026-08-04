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
    const [mobileView, setMobileView] = useState(false)
    const [screenshot, setScreenshot] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string>('mobileview');
    const navigate = useNavigate()

    const HandlePdf = () => {
      console.log(link)

      if (link.includes("&Qtest=Yes")) {
        alert("1) &Qtest=Yes is removing in pdf.\n2) Don't forget to keep &Qtest=Yes  in SFMC")
      } else if (link.includes("AAE3272")) {
        alert("Don't forget to keep &Qtest=Yes  in SFMC")
      }

      let newLink = link
      let strNotUseful = `%%[
Var @honeyPotLink
Set @honeyPotLink = Lookup("ENT.CodeSnippetsForEmails","SnippetValue","SnippetKey","honeyPotLink")
]%%
<a alias="candys" href="%%=RedirectTo(@honeyPotLink)=%%"></a>
<custom type="footer" name="footer" />
<custom name="opencounter" type="tracking"/>`

      if (newLink.includes(strNotUseful)) {
        newLink = newLink.split(strNotUseful).join("")
      }

      if (selectedOption == 'screenshot') {
        setResponse(true)
        axios.post(`${process.env.REACT_APP_SERVER_URL}/emailThumb`, {
          data: newLink,
          preheader2,
          subject2,
          // @ts-ignore
        mobileView: selectedOption == 'mobileview',
        screenshot: false,
        }, { responseType: 'json' })
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
      }

      if (selectedOption == 'mobileview' || selectedOption == 'none') {
        setResponse(true)
        axios.post(`${process.env.REACT_APP_SERVER_URL}/pdfMaker`, {
            data: newLink,
            preheader2,
            subject2,
            // @ts-ignore
        mobileView: selectedOption == 'mobileview',
        screenshot: false,
          }, { responseType: 'arraybuffer' })
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
        console.log(res.data.count, "test")
      })
      .catch(err => {
        console.log(err.message)
      })
    }, [isresponse])

    return (
        <div>
            <div></div>
            <div style={{ textAlign: "center" as const, display: "flex", justifyContent: "space-between" as const }}>
              <div>
              <button
                onClick={() => navigate("/")}
                style={{ width: "10%", color: "#000000", backgroundColor: "#ffffff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", position: "absolute" as const, right: 0, marginRight: "20px", padding: "8px 12px", cursor: "pointer" }}
              >
                Go to Home
              </button>

              <div style={{ display: "none", justifyContent: "center" as const, alignItems: "center" as const }}>
                <div>
                  <label>
                    <input type="radio" value="mobileview" checked={selectedOption === 'mobileview'} onChange={() => setSelectedOption('mobileview')} />
                    Mobile View
                  </label>
                </div>
                <div>
                  <label>
                    <input type="radio" value="screenshot" checked={selectedOption === 'screenshot'} onChange={() => setSelectedOption('screenshot')} disabled />
                    Screenshot
                  </label>
                </div>
                <div>
                  <label>
                    <input type="radio" value="none" checked={selectedOption === 'none'} onChange={() => setSelectedOption('none')} disabled />
                    None
                  </label>
                </div>
              </div>

              <button
                id='ThemeButtonSave'
                onClick={HandlePdf}
                disabled={isresponse}
                style={{ margin: "20px 0px", width: "40%", opacity: isresponse ? 0.7 : 1, cursor: isresponse ? "not-allowed" : "pointer", padding: "8px 16px", borderRadius: "4px", border: "none" }}
              >
                {isresponse ? "Processing..." : "PDF"}
              </button>
              <br />

              <textarea
                spellCheck={false}
                value={subject2}
                onChange={(e) => setSubject2(e.target.value)}
                placeholder='Add Multiple subject lines'
                style={{ width: "80%", marginTop: "5px", marginBottom: "5px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />

              <textarea
                spellCheck={false}
                value={preheader2}
                onChange={(e) => setPreheader2(e.target.value)}
                placeholder='Add Multiple preHeaders'
                style={{ width: "80%", marginTop: "5px", marginBottom: "5px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />

              <textarea
                spellCheck={false}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder='Enter Html Code from mass email or veeva html code you get from veeva vault in case you have multiple subject lines or preheaders just fill above input box else leave empty'
                style={{ width: "500px", height: "67vh", backgroundColor: "#333333", color: "#ffffff", padding: "8px", border: "1px solid #555", borderRadius: "4px" }}
              />
              </div>

              <div>
                <div style={{ height: "13vh", textAlign: "left" as const }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", backgroundColor: "#edf2f7", borderRadius: "4px", fontSize: "12px" }}>
                    Pdf's created so far with Tool <span style={{ color: "red" }}>{countValue}</span>
                  </span><br />
                  <span style={{ display: "inline-block", padding: "2px 8px", backgroundColor: "#edf2f7", borderRadius: "4px", fontSize: "12px", marginTop: "4px" }}>
                    avarage Time taken to create pdf is 10min if its tool less than 1min
                  </span><br />
                  <span style={{ display: "inline-block", padding: "2px 8px", backgroundColor: "#edf2f7", borderRadius: "4px", fontSize: "12px", marginTop: "4px" }}>
                    total Time saved <span style={{ color: "red" }}>{(countValue as any) * 9}</span> mins
                  </span><br />
                </div>
                <iframe
                  srcDoc={link}
                  width="730px"
                  height={"87%"}
                  title="email_preview"
                  style={{ border: "5px solid #e6e6e6", overflowX: "hidden" as const }}
                ></iframe>
              </div>
            </div>
        </div>
    )
}

export default PDFpage
