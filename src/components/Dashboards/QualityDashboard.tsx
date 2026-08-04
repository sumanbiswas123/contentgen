import { LuFolder } from "react-icons/lu";
import { VscReferences } from "react-icons/vsc";
import { GrInProgress } from "react-icons/gr";
import { TbStatusChange } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import Logout from "../Auth/Logout";
import { FaRegEdit } from "react-icons/fa";
import styles from "./QualityDashboard.module.css"

const QualityDashboard = () => {
  const [userList, setUserList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [isFake, setFake] = useState(1)
  const navigate = useNavigate()
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgurls, setImgUrls] = useState([]);
  const [isEditID, setEditID] = useState('')
  const [editAssignee, setEditAssignee] = useState(false)
  const [searchAssignee, setSearchAssignee]  = useState("")
  const [isStatusEditID, setStatusEditID] = useState("")
  const [editStatusAssignee, setEditStatusAssignee] = useState(false)
  const [searchStatusAssignee, setSearchStatusAssignee] = useState('')

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

  const handleTaskList = () => {
    let quality = sessionStorage.getItem("username") || "";
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/task/qualityTaskList?quality=${quality}`)
      .then((res) => {
        setTaskList(res.data.taskList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUpdateAssignee = (newUser) =>{
    axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${isEditID}`,{resourceName:newUser})
    .then(res=>{
        setFake(prev=>prev+1)
        setSearchAssignee('')
    })
    .catch(err=>{
        alert("server error")
       console.log(err)
    })
  }

  const handleUpdateStatusAssignee = (newStatus)=>{
    if(newStatus == ''){
      alert('choose correct status')
      return;
    }
    let quality = sessionStorage.getItem("username") || "";

    axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${isStatusEditID}`,{status:newStatus,quality:quality})
    .then(res=>{
        setFake(prev=>prev+1)
        setSearchStatusAssignee('')
    })
    .catch(err=>{
        alert("server error")
       console.log(err)
    })
  }

  useEffect(() => {
    let role = sessionStorage.getItem('role') || ''
      if(role === 'QA'){
        handleTeamList();
        handleTaskList();
    }else{
        navigate('/login')
    }
  }, [isFake]);

  const downloadHTML = (task) => {
    setisLoading(true);

    let draftEmailBody = JSON.parse(task.draftEmailBody)
    let Body = draftEmailBody.body
    let SubjectLine = draftEmailBody.subjectline
    let PreHeader = draftEmailBody.preheader
    let PMDate = draftEmailBody.pmdate
    let header = draftEmailBody.header
    let footer = draftEmailBody.footer
    let BrandThemeColor = draftEmailBody.isTheme;

    let fullBOdy = ""
    Body.forEach((e,i)=>{
      fullBOdy  = fullBOdy + e.code;
    })

    let Template =  `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN" id="Emailer">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${SubjectLine}</title>
    <style type="text/css">
      /*Css Reset Start*/
      body,
      #body_style {
        width: 100% !important;
        background: #ffffff;
        font-family: Arial;
        color: #ffffff;
        line-height: 1;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass table,
      .ExternalClass div {
        line-height: 100%;
      }
      body {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
        margin: 0 !important;
      }
      body,
      img,
      div,
      p,
      ul,
      li,
      span,
      strong,
      a {
        margin: 0;
        padding: 0;
      }
      table {
        border-spacing: 0;
      }
      table td,
      table th {
        border-collapse: collapse;
      }
      div {
        margin: 0 !important;
        padding: 0 !important;
      }
      a {
        outline: none !important;
      }
      a[href^="tel"],
      a[href^="sms"] {
        text-decoration: none;
        color: inherit !important;
      }
      img {
        display: block !important;
        border: none !important;
        outline: none !important;
        text-decoration: none;
      }
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      .appleLinks {
        color: inherit;
        text-decoration: none;
      }
      .appleLinks a {
        color: inherit;
        text-decoration: none;
      }

      /*Css Reset End*/

      /*media query Start*/
      @media only screen and (max-width: 599px) {
        td[class="Wrapper"] table[class="Container"] {
          width: 100% !important;
        }
        td[class="Wrapper"] .hero_image img {
          width: 100% !important;
          height: auto !important;
        }
        .hideSpace {
          display: none !important;
        }
        .blockSpace {
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        *[class="gmail-fix"] {
          display: none !important;
        }
        td[class="Wrapper"] .col-100 {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          float: none !important;
        }
        td[class="Wrapper"] .col-50 {
          width: 50% !important;
          height: auto !important;
          float: none !important;
        }
        .brk_none br {
          display: none !important;
        }
        td[class="Wrapper"] .fragment_image img {
          width: 100% !important;
          height: auto !important;
        }
      }

      @media only screen and (max-width: 479px) {
        .setPadding {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
        .blockSpace1 {
          width: 100% !important;
          height: 20px !important;
          display: block !important;
        }
        td[class="Wrapper"] .col-50 {
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        td[class="Wrapper"] .col-header {
          width: 100% !important;
          float: none !important;
          display: block !important;
        }
        table[class="dec_width"] {
          width: 280px !important;
        }
        img[class="rezize"] {
          width: 100% !important;
          height: auto !important;
        }
        .brk_none br {
          display: none !important;
        }
      }
    </style>
  </head>
  <body
    style="
      font-family: Arial;
      font-size: 12px;
      font-weight: normal;
      color: #151515;
      background: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
    yahoo="fix"
  >
    <div
    data-test="pre-header"
      style="
        display: none;
        font-size: 1px;
        color: #151515;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      ${PreHeader}
    </div>
    <table
      width="100%"
      bgcolor="#F5F5F5"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
    >
      <tbody>
        <tr>
          <td class="Wrapper" align="center" valign="top">
            <table
              bgcolor="#ffffff"
              class="Container"
              width="600"
              border="0"
              cellspacing="0"
              cellpadding="0"
              align="center"
              role="presentation"
            >
              <tbody id="start">
              ${header}
              ${fullBOdy}
              ${footer}
              ${PMDate}
                <tr class="gmail-fix">
                  <td>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="600"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f8f6f5"
                            height="1"
                            style="line-height: 1px; min-width: 600px"
                          >
                            <img
                              src="assets/trans.png"
                              width="600"
                              height="1"
                              alt=""
                              style="
                                display: block;
                                max-height: 1px;
                                min-height: 1px;
                                min-width: 600px;
                                width: 600px;
                              "
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`
    if (!isDownloading) {
      const Downloadable = Template.replace(
        new RegExp(`${process.env.REACT_APP_SERVER_URL}/`, "g"),
        ""
      ).replace(
        /\${BrandThemeColor}/g,
        BrandThemeColor
      ).replace("logos/", "assets/");
      setIsDownloading(true);

      downloadZip(imgurls, Downloadable);

      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  const downloadZip = async (imageUrls, Downloadable) => {
    let headerusedImages =
      JSON.parse(localStorage.getItem("mailHeaderImages")) || [];
    let footerusedImages =
      JSON.parse(localStorage.getItem("mailFooterImages")) || [];
    const zip = new JSZip();
    const folder = zip.folder("assets");

    const parser = new DOMParser();
    const doc = parser.parseFromString(Downloadable, "text/html");

    const imgElements = doc.querySelectorAll("img");
    const srcValues = Array.from(imgElements).map((img) =>
      img.getAttribute("src")
    );

    let modifiedSrcValues = srcValues.map((item) => {
      let img = item.split("/");
      let finalimg = img.reverse()[0];
      return finalimg;
    });

    const downloadPromises = modifiedSrcValues.map(async (imageUrl) => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/assets/${imageUrl}`
      );
      const arrayBuffer = await response.arrayBuffer();
      const filename = imageUrl.split("/").pop();
      folder.file(`${filename}`, arrayBuffer);
    });

    zip.file("index.html", Downloadable);
    await Promise.all(downloadPromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = "output.zip";
    downloadLink.click();
    setisLoading(false);
  };

  return (
    <div style={{height:"80vh", padding: "20px", fontFamily: "Arial, sans-serif"}}>
      <span style={{position:"absolute",right:"20px",top:"10px"}}>
        <Logout/>
      </span>
      
      <div style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center" as const, gap: "8px" }}>
        <LuFolder />
        <span style={{ fontWeight: "bold" }}>Projects assigned to you..</span>
      </div>

      <div style={{display:'flex',justifyContent:'center'}}>
        <div style={{width: "95%", overflowX: "auto"}}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" as const }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #151515" }}>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><VscReferences /> Jira ID</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><TbStatusChange /> Status</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaRegUser /> Assigned To</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaTasks /> Task Type</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><GrInProgress /> Due Date</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaRegUser /> Developed By</span></th>
                <th style={{ padding: "12px 8px" }}>Start Review</th>
              </tr>
            </thead>
            <tbody>
              {taskList &&
                taskList?.map((task: any, i) => {
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #6313b0" }}>
                      <td style={{ padding: "12px 8px" }}>{task.jiraId}</td>
                      
                      {isStatusEditID == task._id && editStatusAssignee ? (
                        <td style={{position:'relative', padding: "12px 8px", minWidth: "200px"}}>
                          <select 
                            name="status" 
                            id="taskstatus" 
                            style={{ padding: "6px", borderRadius: "4px" }}
                            onChange={(e)=>{
                              setSearchStatusAssignee(e.target.value)
                              handleUpdateStatusAssignee(e.target.value)
                              setEditStatusAssignee(false)
                            }}
                          >
                            <option value="todo">todo</option>
                            <option value="inprogress">inprogress</option>
                            <option value="review">review</option>
                            <option value="deployment">deployment</option>
                          </select>
                        </td>
                      ) : (
                        <td 
                          style={{ padding: "12px 8px", cursor: "pointer" }}
                          onClick={()=>{
                            setStatusEditID(task._id)
                            setEditStatusAssignee(true)
                          }}
                        >
                          <button style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center" as const, gap: "4px" }}>
                            <FaRegEdit/> {task.status}
                          </button>
                        </td>
                      )}

                      {isEditID == task._id && editAssignee ? (
                        <td style={{position:'relative', padding: "12px 8px", minWidth: "200px"}}>
                          <input 
                            value={searchAssignee} 
                            type="search" 
                            placeholder="search user" 
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                            onChange={(e)=>{
                              setSearchAssignee(e.target.value)
                            }} 
                            className={styles.inputbox} 
                          />
                          {isEditID == task._id && editAssignee && (
                            <div style={{ display: editAssignee ? "block" : "none", position:'absolute', top:'50px', zIndex: 20, backgroundColor:"#fff", border: "1px solid #ccc", maxHeight: "100px", overflowY: "scroll" as const, width: "160px" }}>
                              {searchAssignee && userList && userList.map((item: string, index) => {
                                if (item.toLowerCase().includes(searchAssignee.toLowerCase())) {
                                  return (
                                    <p
                                      key={index}
                                      style={{ cursor: "pointer", margin: "4px", padding: "4px" }}
                                      onClick={() => {
                                        setSearchAssignee(item);
                                        handleUpdateAssignee(item)
                                        setEditAssignee(false);
                                      }}
                                    >
                                      {item.split("@")[0]}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </td>
                      ) : (
                        <td 
                          style={{ padding: "12px 8px", cursor: "pointer" }}
                          onClick={()=>{
                            setEditID(task._id)
                            setEditAssignee(true)
                          }}
                        >
                          <button style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center" as const, gap: "4px" }}>
                            <FaRegEdit/> {task.resourceName.split("@")[0]}
                          </button>
                        </td>
                      )}

                      <td style={{ padding: "12px 8px" }}>{task.taskType}</td>
                      <td style={{ padding: "12px 8px" }}>{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: "12px 8px" }}>{task.developer.length == 0 ? 'Not Developed Yet' : task.developer[0].split('@')[0]}</td>

                      <td style={{ padding: "12px 8px" }}>
                        <button 
                          disabled={isLoading} 
                          onClick={()=>downloadHTML(task)}
                          style={{ display: "flex", alignItems: "center" as const, gap: "6px", padding: "6px 12px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: "#f0f0f0" }}
                        >
                          Download <MdOutlineDownloadForOffline />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div style={{ textAlign: "center" as const, padding: "20px 0", color: "#666" }}>
            Table Shows all tasks assigned to {sessionStorage.getItem('username')?.split("@")[0] || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;
