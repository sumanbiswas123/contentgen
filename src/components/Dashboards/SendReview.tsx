import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getBody, getBrandTheme, getFooter, getHeader, getImages, getPM, getPreHeader, getServerImages, getSubjectLine } from '../../Redux/ProductReducer/action';
import { useDispatch } from 'react-redux';

const SendReview = () => {
    const [isModalSaveOpen, setIsModalSaveOpen] = useState(false);
    const [isPmId, setPmId] = useState("")
    const [userList, setUserList] = useState([])
    const [resourceName, setResourceName] = useState('')  
    const [listDisplay, setListDisplay] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onCloseSaveModal = ()=>{
        setIsModalSaveOpen(false)
    }
    
    const onOpenSaveModal = ()=>{
        setIsModalSaveOpen(true)
    }

    const ClearLS =()=>{
        var keysToDelete = ['footer', 'mailImages', 'header',"preheader",'pmdate','subjectline','body',"mailHeaderImages","mailFooterImages",'TrackerId', 'isTheme','CustomCss'];  
        for (var i = 0; i < keysToDelete.length; i++) {
          localStorage.removeItem(keysToDelete[i]);
        }
        dispatch(getBody(''))
        dispatch(getFooter(''))
        dispatch(getHeader(''))
        dispatch(getPM(''))
        dispatch(getSubjectLine(''))
        dispatch(getPreHeader(''))
        dispatch(getImages(''))
        dispatch(getServerImages(''))
        dispatch(getBrandTheme(''))
    }

    const handleSaveAsDraft =() =>{
        let currentEmailIDObj = JSON.parse(localStorage.getItem('TrackerId') || '{}')
        let currentEmailId = currentEmailIDObj?._id
        let bodyLs = JSON.parse(localStorage.getItem("body") || '[]')
        let subjectlineLs = (localStorage.getItem("subjectline")) || ""
        let preheaderLs = (localStorage.getItem("preheader")) || ""
        let pmdateLs =(localStorage.getItem("pmdate")) || ""
        let headerLs = localStorage.getItem("header") || ""
        let footerLs = localStorage.getItem("footer") || ""
        let mailImagesLs = JSON.parse(localStorage.getItem("mailImages") || '[]')
        let isTheme = localStorage.getItem('isTheme') || ''
    
        let TemplateDataObj = {
            body :bodyLs,
            subjectline:subjectlineLs,
            preheader:preheaderLs,
            pmdate:pmdateLs,
            header:headerLs,
            footer:footerLs,
            mailImages:mailImagesLs,
            isTheme:isTheme
        }
    
        let developerName = sessionStorage.getItem('username') || ''
        let timeSpentDeveloper = Number(Cookies.get('capsul') || 0) + Number(Cookies.get('PreviousCapsul') || 0)
    
        axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${currentEmailId}`,{draftEmailBody:JSON.stringify(TemplateDataObj),developer:developerName,timeSpentDeveloper:timeSpentDeveloper,resourceName:resourceName,status:"review",pmNumber:isPmId})
        .then(res=>{
            ClearLS()
            alert(`Task Moved to Qc ${resourceName}`)
            navigate('/developer-dashboard')
        })
        .catch(err=>{
            console.log(err)
            alert("server error cannot be saved")
        })
    }

    const handleSend = (e: any)=>{
        e.preventDefault()
        if(!userList.includes(resourceName as never)){
            alert('choose correct team member from list')
            return;
        }
        handleSaveAsDraft()
    }

    const handleTeamList = () => {
        axios
          .get(`${process.env.REACT_APP_SERVER_URL}/user/teamlist`)
          .then((res) => {
            setUserList(res.data.teamlist);
          })
          .catch((err) => {
            console.log(err);
          });
    };

    useEffect(()=>{
        handleTeamList()
    },[])

  return (
    <div>
        <button 
          className="MenuButtons" 
          onClick={onOpenSaveModal}
          style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}
        >
          Send To Review
        </button>

        {isModalSaveOpen && (
          <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>Confirm <span style={{ color: "green" }}>Send</span></h3>
                <button onClick={onCloseSaveModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>

              <form onSubmit={handleSend}>
                <div style={{ marginBottom: "15px" }}>
                  <p style={{ margin: "0 0 10px 0" }}>Search QC and Assign Task to Review ?</p>
                  
                  <input 
                    className='InputBox' 
                    placeholder="PM NUMBER" 
                    value={isPmId} 
                    onChange={e=>setPmId(e.target.value)}  
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                    required
                  />

                  <input
                    type="search"
                    className='InputBox'
                    placeholder="Search To Assign"
                    value={resourceName}
                    onChange={(e) => {
                      setListDisplay(true);
                      setResourceName(e.target.value);
                    }}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    required
                  />

                  {listDisplay && (
                    <div style={{ display: "block", maxHeight: "100px", overflowY: 'scroll', border: "1px solid #eee", marginTop: "5px", padding: "5px" }}>
                      {resourceName && userList && userList.map((item: any, index: number) => {
                        if (item.toLowerCase().includes(resourceName.toLowerCase())) {
                          return (
                            <div
                              key={index}
                              style={{ cursor: "pointer", padding: "4px 8px" }}
                              onClick={() => {
                                setResourceName(item);
                                setListDisplay(false);
                              }}
                            >
                              {item}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <button 
                    type="button" 
                    onClick={onCloseSaveModal} 
                    style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    id='ThemeButtonSave'
                    style={{ padding: "8px 16px", backgroundColor: "green", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default SendReview