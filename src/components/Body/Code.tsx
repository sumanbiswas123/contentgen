import React from 'react'
import TextEditor from '../LayoutEditor/TextEditor'
import { useDispatch } from 'react-redux'
import { getUserCode } from '../../Redux/ProductReducer/action'

const Code = () => {
    const dispatch = useDispatch()
    const HandleHtmlCode = ()=>{
        alert("lets check")
    }
    const HandleCodeMode = (code: string)=>{
        dispatch(getUserCode({ type: "UserCode", code: code }))
    }
  return (
    <div>
      <TextEditor onContentChange = {HandleCodeMode} prevCode={""} typeObj={null} />
    </div>
  )
}

export default Code