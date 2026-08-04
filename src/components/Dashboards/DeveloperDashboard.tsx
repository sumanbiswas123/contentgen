import { LuFolder } from "react-icons/lu";
import { MdPlayLesson } from "react-icons/md";
import { VscReferences } from "react-icons/vsc";
import { GrInProgress } from "react-icons/gr";
import { TbStatusChange } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import styles from "./DeveloperDashboard.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Cookies from 'js-cookie';
import { getBody, getBrandTheme, getCapsulTimer, getFooter, getHeader, getImages, getPM, getPreHeader, getServerImages, getSubjectLine } from "../../Redux/ProductReducer/action";
import Logout from "../Auth/Logout";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const DeveloperDashboard = () => {
  const [userList, setUserList] = useState([]);
  const [listDisplay, setListDisplay] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [isFake, setFake] = useState(1)
  const [isLoadingID, setLoadingID] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<any>({})
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
    let developer = sessionStorage.getItem("username") || "";
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/task/developerTaskList?developer=${developer}`)
      .then((res) => {
        setTaskList(res.data.taskList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCanvasToCreateTask = (task) =>{
    let username = task.resourceName
    let jiraid = task.jiraId
    let _id = task._id
    localStorage.setItem("TrackerId",JSON.stringify({username,jiraid,_id}))

    var needTimeStamp = false;
    if(task.status == 'todo'){
      needTimeStamp = true
    }

    let reqDetailsToUpdate = needTimeStamp ?{
      status:'inprogress',
      startTime:new Date()
    }: {
      status:'inprogress',
    }

    axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${task._id}`,reqDetailsToUpdate)
    .then(res=>{
       ClearLS()
        let emailBody
        if(res.data.data?.draftEmailBody){
            emailBody = JSON.parse(res.data.data?.draftEmailBody)
        }else{
            emailBody = {body:[],footer:'',header:'',pmdate:'',subjectline:'',preheader:'',mailImages:[],isTheme:''}
        }

       HandleuseTemplate(emailBody)
        Cookies.set('PreviousCapsul', String(Number(res.data.data.timeSpentDeveloper)), { expires: 7 });
        Cookies.set('capsul', '0', { expires: 7 });
       localStorage.setItem('cursorPointer','0')
    })
    .catch(err=>{
       console.log(err)
    })
  }

  const handleSaveAsDraft =() =>{
    let currentEmailIDObj = JSON.parse(localStorage.getItem('TrackerId')) || {}
    let currentEmailId = currentEmailIDObj?._id
    let bodyLs = JSON.parse(localStorage.getItem("body")) || []
    let subjectlineLs = (localStorage.getItem("subjectline")) || ""
    let preheaderLs = (localStorage.getItem("preheader")) || ""
    let pmdateLs =(localStorage.getItem("pmdate")) || ""
    let headerLs = localStorage.getItem("header") || ""
    let footerLs = localStorage.getItem("footer") || ""
    let mailImagesLs = JSON.parse(localStorage.getItem("mailImages")) || []
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
    let timeSpentDeveloper = Number(Cookies.get('capsul')) + Number(Cookies.get('PreviousCapsul'))

    axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${currentEmailId}`,{draftEmailBody:JSON.stringify(TemplateDataObj),developer:developerName,timeSpentDeveloper:timeSpentDeveloper})
    .then(res=>{
        alert('you are shifting to new Task all your previous changes saving as draft')
    })
    .catch(err=>{
        console.log(err)
        alert("server error cannot be saved")
        return;
    })

    handleCanvasToCreateTask(activeTask)
  }

  const ClearLS =()=>{
    var keysToDelete = ['footer', 'mailImages', 'header',"preheader",'pmdate','subjectline','body',"mailHeaderImages","mailFooterImages","CustomCss"];

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
  }

  const HandleuseTemplate = (e)=>{
    dispatch(getBody(e.body))
    dispatch(getHeader(e.header))
    dispatch(getFooter(e.footer))
    dispatch(getPreHeader(e.preheader))
    dispatch(getSubjectLine(e.subjectline))
    dispatch(getPM(e.pmdate))
    dispatch(getServerImages(e.mailImages))
    dispatch(getBrandTheme(e.isTheme))
    localStorage.setItem('isTheme',e.isTheme)
    navigate('/')
  }

  const handleUpdateStatusAssignee = (newStatus)=>{
    if(newStatus == ''){
      alert('choose correct status')
      return;
    }

    axios.patch(`${process.env.REACT_APP_SERVER_URL}/task/updateTask/${isStatusEditID}`,{status:newStatus})
    .then(res=>{
        setFake(prev=>prev+1)
        setSearchStatusAssignee('')
    })
    .catch(err=>{
        alert("server error")
       console.log(err)
    })
  }

  const handleDelete = (_id) =>{
    setLoadingID(_id)
    axios.delete(`${process.env.REACT_APP_SERVER_URL}/task/delete?_id=${_id}`)
    .then(res=>{
        alert(res.data.message)
        setFake(prev=>prev+1)
        setLoadingID('')
    })
    .catch(err=>{
        console.log(err)
        setLoadingID('')
    })
  }

  const handleStartTask = (task) =>{
    setActiveTask(task)
    let currentEmailIDObj = JSON.parse(localStorage.getItem('TrackerId')) || {}
    let currentEmailId = currentEmailIDObj?._id
    if(!currentEmailId){
        let username = task.resourceName
        let jiraid = task.jiraId
        let _id = task._id
        localStorage.setItem("TrackerId",JSON.stringify({username,jiraid,_id}))
        handleCanvasToCreateTask(task)
        return;
    }

    if(currentEmailId !== task._id){    
        setIsOpen(true)
        return;
    }else{
        navigate('/')
    }
  }

  const handleCloseButton = () =>{
    setIsOpen(false)
    handleCanvasToCreateTask(activeTask)
  }

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

  useEffect(() => {
    let role = sessionStorage.getItem('role') || ''
    if(role == 'Developer'){
          handleTeamList();
          handleTaskList();
      }else{
          navigate('/login') 
      }
  }, [isFake]);

  return (
    <div style={{height:"80vh", padding: "20px", fontFamily: "Arial, sans-serif"}}>
      <span style={{position:"absolute",right:"20px",top:"10px"}}>
        <Logout/>
      </span>
      
      <div style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
        <Link to='/pdf'>
          <button style={{backgroundColor:'#fff',border:'1px solid #5516a3',color:'#5516a3', padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"}} >
            CREATE PDF
          </button>
        </Link>
      </div>

      <div style={{display:'flex',justifyContent:'center'}}>
        <div style={{width: '95%', overflowX: "auto"}}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" as const }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #151515" }}>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><VscReferences /> Jira ID</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><TbStatusChange /> Status</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaRegUser /> Assigned To</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaTasks /> Task Type</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><GrInProgress /> Due Date</span></th>
                <th style={{ padding: "12px 8px" }}><span style={{display: "flex", alignItems: "center" as const, gap: "4px"}}><FaRegUser /> Reviewed By</span></th>
                <th style={{ padding: "12px 8px" }}>Delete</th>
                <th style={{ padding: "12px 8px" }}>Start working</th>
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
                            <option value="">Choose Status</option>
                            <option value="todo">todo</option>
                            <option value="inprogress">inprogress</option>
                            <option value="review">review</option>
                            <option value="deployment">deployment</option>
                            <option value="done">done</option>
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
                      <td style={{ padding: "12px 8px" }}>{task.quality.length == 0 ? 'Not Reviewed Yet' : task.developer[0]}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <button 
                          style={{ border: "none", background: "none", cursor: "pointer", color: "red", fontSize: "1.2rem" }}
                          disabled={isLoadingID === task._id} 
                          onClick={()=>handleDelete(task._id)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button 
                          onClick={()=>handleStartTask(task)} 
                          style={{ display: "flex", alignItems: "center" as const, gap: "6px", padding: "6px 12px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: "#f0f0f0" }}
                        >
                          {task.status == 'inprogress'?'Resume':'Start'} <MdPlayLesson />
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

      {/* Modal Dialog */}
      {isOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", maxWidth: "400px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Do You Want To Save Template</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <div style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.5" }}>
              You are working on different task currently, do you want to save changes made before going to new one?
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
              <button 
                onClick={handleCloseButton} 
                style={{ padding: "8px 16px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
              <button 
                onClick={handleSaveAsDraft} 
                style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Save As Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;