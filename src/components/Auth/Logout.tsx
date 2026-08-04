
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoLogOutOutline } from "react-icons/io5";  

function Logout() {
    const navigate=useNavigate()
    function handleLogOut(){
        sessionStorage.clear()
        navigate('/login')
    }
  return (
    <button id='ThemeButtonSave' className="btn-accent" style={{fontWeight:"bold",backgroundColor:"blue",color:"white",borderRadius:"100%",padding:"10px",border:"4px solid #f3f3f3",boxShadow:" rgba(0, 0, 0, 0.35) 0px 5px 15px", cursor: "pointer"}} title='Logout' onClick={handleLogOut} ><IoLogOutOutline /></button>
  )
}

export default Logout