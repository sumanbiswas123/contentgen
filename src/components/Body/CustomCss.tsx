import React, { useState } from 'react'
import TextEditor from '../LayoutEditor/TextEditor'
import { useDispatch, useSelector } from 'react-redux'
import { getCustomCss, getUserCode } from '../../Redux/ProductReducer/action'

const CustomCss = () => {
    const dispatch = useDispatch()
    const {CustomCss} = useSelector((selector: any)=>selector.ProductReducer)
    const [reqCss, setReqCss] = useState(CustomCss || '')



    
    // const HandleHtmlCode = ()=>{
    //     alert("lets check")
    // }


    
    const HandleCodeMode = (code: string)=>{
        // console.log(code)
        // alert(code)
        localStorage.setItem('CustomCss',JSON.stringify(code))
        dispatch(getCustomCss( code ))
    }
  return (
    <div style={{position:'relative'}}>
              <span style={{backgroundColor:"#ffffff",position:'absolute',fontSize:"10px",fontWeight:"600",left:"15px",top:'60px',zIndex:200}}>Custom Css</span>
      <TextEditor onContentChange = {HandleCodeMode} prevCode={reqCss} typeObj={null} />
    </div>
  )
}

export default CustomCss