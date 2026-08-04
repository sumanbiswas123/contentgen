import React, { useEffect, useState } from 'react'
import ImageReusable from "../EditorSkills/ImageReusable";
import { useDispatch } from 'react-redux';
import { getCimg } from '../../Redux/ProductReducer/action';


const CImage = () => {
  
  // const [isImgStyles,setImgStyles] = useState<any>({})
  const dispatch = useDispatch()
  
  

  const handleImg =(imgURL,imgBackgroundLink,imgHeight,imgWidth,imgALT,isalign)=>{
    // console.log(imgURL,imgBackgroundLink,imgHeight,imgWidth,imgALT,isalign)
    
    // console.log(imgURL,imgBackgroundLink,imgHeight,imgWidth,imgALT,isalign)
    var imghtml = imgBackgroundLink? `<tr>
    <td align="left" valign="top" class="${imgWidth > 280?"hero_image":"no"}">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td style="font-size: 0%;padding: 0px 20px" class="setPadding" align="${isalign}" class="${imgWidth > 280?"hero_image":"no"}">
    <a target="_blank" style="color: #164194; text-decoration: none" href="${imgBackgroundLink}"><img src="${imgURL}" width="${imgWidth}" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    border-radius: 8px;
    "></a>
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>` :  `<tr>
    <td align="left" valign="top" class="${imgWidth > 280?"hero_image":"no"}">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td style="font-size: 0%;padding:0px 20px" class="setPadding"  align="${isalign}" class="${imgWidth > 280?"hero_image":"no"}">
    <img src="${imgURL}" width="${imgWidth}" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    border-radius: 8px;
    ">
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`

    // console.log(imghtml)
    CimgCode(imghtml)
    
    

  }


  const CimgCode =(imghtml)=>{
    // console.log( isImgStyles.imgURL,isImgStyles.imgBackgroundLink,isImgStyles.imgHeight,isImgStyles.imgWidth,isImgStyles.imgALT,isImgStyles.isalign)
   
    // dispatch(getCimg(imghtml))
    // console.log("see",imghtml)



    dispatch(getCimg({type:"CImg",code:imghtml}))
  }


  // CimgCode()

 

  return (
    <div>
        <ImageReusable onContentChange={handleImg}/>
    </div>
  )

}

export default CImage