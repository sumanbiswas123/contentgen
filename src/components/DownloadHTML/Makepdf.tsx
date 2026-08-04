import axios from 'axios'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const Makepdf = () => {
    const navigate = useNavigate();
    
    const Handlepdf = () =>{
        navigate("/pdf")
    }

  return (
    <div>
        <button
          className="MenuButtons"
          onClick={Handlepdf}
          style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}
        >
          Generate PDF
        </button>
    </div>
  )
}

export default Makepdf