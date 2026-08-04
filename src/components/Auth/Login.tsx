import React, { useState } from 'react';

import './Login.css'; // Import your custom styles
import axios from "axios"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import HogarthLogo from "../Body/image_assets/Hogarth_Studios_Logo.png"
import bgimg from "./images/LoginBackground.png"


const Login = () => {
    const [formdata, setFormData] = useState({
        email:'',
        password:'',
        role:''
    })
    const [isLoading, setLoading] = useState(false)
    const [isLogin, setLogin] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const HandleformDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        // console.log(e.target.value)
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
    }
    const HandleForm = (event: React.FormEvent)=>{
        event.preventDefault()
        setLoading(true)
        console.log(formdata)
        axios.post(`${process.env.REACT_APP_SERVER_URL}/user/login`,formdata)
        .then(res=>{
            
            // console.log(res.data)
            // res.data.user.password = "secret"
            
            sessionStorage.setItem("isAuth",JSON.stringify(res.data.token))
            // dispatch(getAuth(res.data))
            // sessionStorage.setItem("isAuth",res.data.token)
            sessionStorage.setItem("username",formdata.email)
            let Role = formdata.role !== ''? formdata.role : res.data.roles;
            sessionStorage.setItem('role',Role)

            if(Role === 'POC'){
              navigate("/developer-dashboard")
            }else if(Role === 'Developer'){
              navigate("/developer-dashboard")
            }else if(Role === 'QA'){
              navigate("/quality-dashboard")
            }

            setLoading(false)
            
            
            // navigate("/")
        })
        .catch(err=>{
            console.log(err.message)
            alert(err.message)
            setLoading(false)
            setLogin(true)
        })
        setFormData({
            email:'',
            password:'',
            role:''
        })
        
    }

  return (
    
    <div className="Login_container">
        <img src={bgimg} className="bg_Login" alt="background_image" />
        <div className="form_Login">
          <img
            src={HogarthLogo}
            className="hogarth_Login"
          />
          <form className="login-form">
          <div className="input-container">
            <input id='emailID_login'
              type="text" placeholder="email" name='email' value={formdata.email} onChange={HandleformDataChange}
            />
          </div>
          <div className="input-container">
            <input
            id='Password_login'
              type="password" placeholder="Password" name='password' value={formdata.password} onChange={HandleformDataChange}
            />
          </div>

          <div className="input-container">
            <select name="role" id="role" value={formdata.role} onChange={HandleformDataChange}>
              <option value="">Choose Role</option>
              <option value="Developer">Developer</option>
              <option value="QA">QC</option>
            </select>
          </div>

          <button disabled={isLoading} id='ThemeButtonSave' onClick={HandleForm} className="button_Login btn-accent">
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          </form>
        </div>
      </div>
  );
};

export default Login;
