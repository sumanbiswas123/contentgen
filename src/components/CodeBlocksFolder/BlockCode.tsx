import React, { useState, useEffect } from 'react'
import copy from "clipboard-copy";
import TextEditor from "../LayoutEditor/TextEditor";
import { useDispatch } from "react-redux";
import { getBody, getCursorPointer } from "../../Redux/ProductReducer/action";
import "./BlockCode.css"
import axios from "axios"

const BlockCode = () => {
  const [blockTempOpen, setBlocktempOpen] = useState(false)
  const [insertModal, setinsertModal] = useState(false)
  const dispatch = useDispatch()
  const [arr, setArr] =  useState([])
  const [isLoading, setLoading] = useState(false)
  const [newComponent, setNewComponent] = useState({
    "type" : "",
    "code" : '',
    "id" : Date.now()
  })

  useEffect(()=>{
    axios.get(`${process.env.REACT_APP_SERVER_URL}/component/get-components`)
    .then(res=>{
      setArr(res.data.data)
    })
    .catch(err=>{
      console.log(err.message)
    })
  },[])

  const handleAddBlockTemplateToTextEditor = (item: any) => {
    alert("Code copied! Paste it in the Editor.");
    copyToClipboard(item.code);
  };

  const copyToClipboard = (text: string) => {
    copy(text)
      .then(() => {
        // console.log("Text copied to clipboard");
      })
      .catch((error) => {
        // console.error("Copy to clipboard failed:", error);
      });
  };

  const onClose = () =>{
    setBlocktempOpen(false);
  }

  const onCloseInsertModal = () =>{
    setinsertModal(false)
  }

  const HandleBlockTemplatesModal = ()=>{
    axios.get(`${process.env.REACT_APP_SERVER_URL}/component/get-components`)
      .then(res=>{
        setArr(res.data.data)
      })
      .catch(err=>{
        console.log(err.message)
      })
    setBlocktempOpen(true);
  }

  const HandleCodeMode = (code: string, typeObj: any)=>{
    let LSBodyArray = JSON.parse(localStorage.getItem("body") || "[]");
    let newObj = {
      type: typeObj.type,
      code: code,
    };
    let CursorPointer = localStorage.getItem("cursorPointer") || "0";
    let newLS = [...LSBodyArray.slice(0, +CursorPointer+1),newObj,...LSBodyArray.slice(+CursorPointer+1)]
    console.log(newLS)
    localStorage.setItem("body", JSON.stringify(newLS));
    let newCursor = newLS.length == 1 ? 0 : +CursorPointer+1
    dispatch(getCursorPointer(newCursor))
    dispatch(getBody(newLS));
  }

  const HandleSubmit = (e: any)=>{
    e.preventDefault()
    setLoading(true)
    axios.post(`${process.env.REACT_APP_SERVER_URL}/component/create-component`,{
      type:newComponent.type,
      token:JSON.parse(sessionStorage.getItem('isAuth') || '""') || '',
      code:newComponent.code
    })
      .then(res=>{
        setArr(res.data.jsonData)
        alert("successfully submitted")
        setLoading(false)
        onCloseInsertModal()
        onClose()
      })
      .catch(err=>{
        console.log(err.message)
        setLoading(false)
      })
  }

  const HandleSearch = (e: any) =>{
    const query = e.target.value
    axios.get(`${process.env.REACT_APP_SERVER_URL}/component/get-components?search=${query}`)
    .then(res=>{
      setArr(res.data.data)
    })
    .catch(err=>{
      console.log(err.message)
    })
  }

  const handleDelete = (id: string) =>{
    let token = JSON.parse(sessionStorage.getItem('isAuth') || '""') || '';
    alert(token)
    axios.delete(`${process.env.REACT_APP_SERVER_URL}/component/delete-component?id=${id}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res=>{
      HandleBlockTemplatesModal()
      alert(res.data.message)
    })
    .catch(err=>{
      alert(err.message)
    })
  }

  return (
    <div>
      <button 
        style={{ padding: "8px 16px", background: "#38a169", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft: "20px", width: "85%", fontSize: "0.875rem" }} 
        onClick={HandleBlockTemplatesModal} 
        id='ThemeButtonSave'
      >
        Choose Block Template
      </button>

      {/* Main Choose Block Template Modal */}
      {blockTempOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }} id='AltNames'>
                <button 
                  id='ThemeButtonSave' 
                  onClick={()=>setinsertModal(true)} 
                  style={{ padding: "6px 12px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}
                >
                  Click to Insert
                </button> 
                Your own Component
              </h3>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <input 
                onChange={HandleSearch} 
                type="search" 
                className='InputBox' 
                style={{ width: "50%", padding: "8px", boxSizing: "border-box" }} 
                placeholder="search component type"
              />
            </div>

            <div style={{ overflowY: "auto" as const, flex: 1, paddingRight: "10px" }}>
              {arr && arr.length > 0 && arr.map((item: any, index: number) => {
                return (
                  <div key={index} style={{ position: "relative" as const, marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                    <div 
                      onClick={() => handleAddBlockTemplateToTextEditor(item)} 
                      style={{ cursor: "pointer", marginTop: "20px", padding: "10px", color: "red", fontWeight: "bold", display: "flex", alignItems: "center" as const, gap: "8px" }}
                    >
                      {item.type} 
                      <span style={{ fontSize: "0.75rem", backgroundColor: "#c6f6d5", color: "#22543d", padding: "2px 6px", borderRadius: "4px" }}>
                        click here to use &#x25BC;
                      </span>
                    </div>

                    <span id="CodeBtn">
                      <TextEditor prevCode={item.code} typeObj={{ type: "UserCode" }} onContentChange={HandleCodeMode} />
                    </span>

                    <div style={{ display: "flex", position: "relative" as const }}>
                      {item.userName === sessionStorage.getItem('username') && (
                        <span style={{ position: 'absolute', right: '5px', zIndex: 10 }}>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            style={{ padding: "4px 8px", backgroundColor: "#e53e3e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                          >
                            delete
                          </button>
                        </span>
                      )}
                      
                      <iframe
                        srcDoc={`<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
                        <html lang="EN">
                          <head>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <meta name="format-detection" content="telephone=no" />
                            <title></title>
                            <style type="text/css">
                              body {
                                width: 100% !important;
                                background: #ffffff;
                                font-family: Arial;
                                color: #ffffff;
                                line-height: 1;
                              }
                            </style>
                          </head>
                          <body style="font-family: Arial; font-size: 12px; color: #151515; background: #ffffff; margin: 0; padding: 0;">
                            <table width="100%" bgcolor="#F5F5F5" border="0" cellspacing="0" cellpadding="0">
                              <tbody>
                                <tr>
                                  <td align="center" valign="top">
                                    <table bgcolor="#ffffff" width="600" border="0" cellspacing="0" cellpadding="0" align="center">
                                      <tbody>
                                        ${item.code}
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </body>
                        </html>`}
                        width="100%"
                        height="200px"
                        title="code_preview"
                        style={{ border: "1px solid #ccc", marginTop: "10px", resize: "vertical" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" as const, borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
              <button 
                id='ThemeButtonSave' 
                onClick={onClose}
                style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Component Modal */}
      {insertModal && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1001 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }} id='AltNames'>Fill Details to Submit</h3>
              <button onClick={onCloseInsertModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <form onSubmit={HandleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label id='AltNames' htmlFor="type" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Specify type of Component</label>
                <input 
                  value={newComponent.type} 
                  onChange={(e) => setNewComponent(prev => ({ ...prev, type: e.target.value }))} 
                  className='InputBox' 
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} 
                  name="type" 
                  type="text" 
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label id='AltNames' htmlFor="code" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Specify code of Component</label>
                <textarea 
                  value={newComponent.code} 
                  onChange={(e)=>setNewComponent(prev =>({...prev, code:e.target.value}))} 
                  style={{ width: "100%", height: "150px", padding: "8px", boxSizing: "border-box" }} 
                  name="code" 
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
                <button 
                  type="button"
                  onClick={onCloseInsertModal}
                  style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Close
                </button>
                <button 
                  disabled={isLoading}
                  type="submit" 
                  id='ThemeButtonSave'
                  style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlockCode