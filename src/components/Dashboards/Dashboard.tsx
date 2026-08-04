import { LuFolder, LuSquareCheck } from "react-icons/lu";
import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logout from "../Auth/Logout";
import DeveloperDashboard from "./DeveloperDashboard";

const Dashboard = () => {
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [isFake, setFake] = useState(1)
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    jiraId: "",
    taskType: "",
    resourceName: "",
    dueDate: "",
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    setLoading(true)
    let createdBy = sessionStorage.getItem("username") || "";
    let finalData = { ...formData, createdBy };
    finalData.resourceName = createdBy
    
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/task/create`, finalData)
      .then((res) => {
        setLoading(false)
        window.location.reload()
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message)
        setLoading(false)
      });
  };

  useEffect(() => {
    let role = sessionStorage.getItem('role') || ''
    if (role !== 'Developer') {
      navigate('/login')
    }
  }, [isFake]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
        <button 
          style={{ padding: "10px 20px", border: "none", background: activeTab === 0 ? "#e2e8f0" : "transparent", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center" as const, gap: "6px" }}
          onClick={() => setActiveTab(0)}
        >
          <LuSquareCheck /> Create Task
        </button>
        <button 
          style={{ padding: "10px 20px", border: "none", background: activeTab === 1 ? "#e2e8f0" : "transparent", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center" as const, gap: "6px" }}
          onClick={() => {
            setActiveTab(1);
            setFake(prev => prev + 1);
          }}
        >
          <LuFolder /> Projects
        </button>
      </div>

      <div>
        {activeTab === 0 && (
          <div className={styles.container} style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Enter jira ID"
                value={formData.jiraId}
                style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, jiraId: e.target.value }))
                }
                className={styles.inputbox}
                required
              />
              
              <select
                name="taskType"
                id="taskType"
                className={styles.inputbox}
                value={formData.taskType}
                style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px" }}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, taskType: e.target.value }))
                }
                required
              >
                <option value="">Choose Task Type</option>
                <option value="Fresh Build">Fresh Build</option>
                <option value="Update Request">Update Request</option>
              </select>

              <label htmlFor="dueDate" style={{ fontSize: "14px", display: "block", marginBottom: "5px" }}>
                Choose Due Date:
              </label>
              
              <input
                type="datetime-local"
                name="dueDate"
                style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className={styles.inputbox}
                required
              />

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: "100%", padding: "10px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                className={styles.inputbox} 
                id={styles.submit}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 1 && (
          <div>
            <DeveloperDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
