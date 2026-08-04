import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { getIP } from '../../../Redux/ProductReducer/action'
import IPimg from "./Thumbs/IP.png";
import ImageReusable from '../../EditorSkills/ImageReusable';
import EditorReuse from '../../EditorSkills/EditorReusable';

const IP = ({onContentChange,stage}) => {
    const dispatch = useDispatch()
    const [isOpenIPModal, setOpenIPModal] = useState(false)
    const [isImage, setImage] = useState<any>({})
    const [isPara, setPara] = useState("")
    const [ isParaStyles, setParaStyles] = useState<any>({})
    const [isChecked, setIsChecked] = useState(false);

    let IPhtml = isChecked?`<tr>
    <td align="center" valign="top" style="background-color:#FFFFFF;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
<tr>
<td height="10" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>

<tr>
<td align="center" valign="top">
<table width="560" align="center" role="presentation" class="col-100" border="0" cellspacing="0" cellpadding="0">
<tbody>
  <tr>
    <td width="320" class="col-100" align="center" valign="top">
      <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>


<tr>
<td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>


<tr>
<td align="left" valign="top" style="color:${isParaStyles.color}; font-family: Arial; font-size:${isParaStyles.fontsize}px; line-height:${+isParaStyles.fontsize+2}px;">${isPara}</td>
<td class="col-100" width="20" align="left" valign="top">&nbsp;</td>
</tr>
        </tbody>
      </table>
      </td><td class="col-100" width="220" align="center" valign="top">
      <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>



<tr>
<td class="col-100" align="center" valign="top"><img src="${isImage.imgURL}" width="${isImage.imgWidth}" alt="${isImage.imgALT}" aria-hidden="true" style=" display: block; border: none;"></td>
</tr>




        </tbody>
      </table>
      </td>



    
  </tr>
</tbody>
</table>
</td>
</tr>						  
                    
<tr>
<td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>
           </tbody>
      </table></td>
  </tr>
</tbody>
</table></td>
</tr>`: `<tr>
    <td align="center" valign="top" style="background-color:#FFFFFF;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
<tr>
<td height="10" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>

<tr>
<td align="center" valign="top">
<table width="560" align="center" role="presentation" class="col-100" border="0" cellspacing="0" cellpadding="0">
<tbody>
  <tr>
    <td class="col-100" width="220" align="center" valign="top">
      <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>



<tr>
<td class="col-100" align="center" valign="top"><img src="${isImage.imgURL}" width="${isImage.imgWidth}" alt="${isImage.imgALT}" aria-hidden="true" style=" display: block; border: none;"></td>
</tr>




        </tbody>
      </table>
      </td>


<td class="col-100" width="20" align="left" valign="top">&nbsp;</td>
    <td width="320" class="col-100" align="center" valign="top">
      <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>


<tr>
<td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>


<tr>
<td align="left" valign="top" style="color:${isParaStyles.color}; font-family: Arial; font-size:${isParaStyles.fontsize}px; line-height:${+isParaStyles.fontsize+2}px;">${isPara}</td>
</tr>
        </tbody>
      </table>
      </td>
  </tr>
</tbody>
</table>
</td>
</tr>						  
                    
<tr>
<td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
</tr>
           </tbody>
      </table></td>
  </tr>
</tbody>
</table></td>
</tr>`

const openIPModal =()=>{
    setOpenIPModal(true)
}
const closeIPModal=()=>{
    setOpenIPModal(false)
}

const handleEditIPcode =()=>{
  onContentChange(IPhtml)
  closeIPModal()
} 

const handleIPcode =()=>{
    
  // dispatch(getIP(IPhtml))
  dispatch(getIP({type:"IP",code:IPhtml}))
  closeIPModal()
}

const handleImage = ( 
    imgURL,
    imgBackgroundLink,
    imgHeight,
    imgWidth,
    imgALT)=>{
        setImage({
            imgURL,
      imgBackgroundLink,
      imgHeight,
      imgWidth,
      imgALT,
          });
}
const handleParagraph =(
    paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
)=>{
    setParaStyles({
        align: align,
        color: color,
        fontsize: fontsize,
        bgcolor: bgcolor,
       })
       setPara(paraHtml)
}


const handleToggle = () => {
    setIsChecked(!isChecked);
  };
  // console.log(isChecked)

  return (
    <div>
         <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", padding: "5px",margin:"10px" }}
      >
        <img
          src={IPimg}
          alt="SpeakerModule.png"
          style={{ width: "100%", height: "70px", cursor: "pointer" }}
          onClick={openIPModal}
        />
        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" as const, color: "#151515", backgroundColor: "#f0efed", padding: "5px", marginTop: "5px" }}>
          IP Module
        </div>
      </div>
      
      {isOpenIPModal && (
        <div className="modal-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: "white", padding: "20px", borderRadius: "8px",
            width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" as const, position: "relative" as const
          }}>
            <div className="modal-header" style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const }}>
              <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                <label style={{ display: "flex", alignItems: "center" as const, gap: "8px", fontSize: "14px", fontWeight: "normal" }}>
                  <input type="checkbox" checked={isChecked} onChange={handleToggle} />
                  change Image left to right
                </label>
              </div>
              <button onClick={closeIPModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <button
                id="ThemeButtonSave"
                onClick={stage ? handleEditIPcode : handleIPcode}
                style={{
                  background: "#3182ce",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  width: "100%",
                  marginBottom: "15px"
                }}
              >
                Create IP Module
              </button>

              <div style={{ margin: "10px" }}>
                  <ImageReusable onContentChange={handleImage}/>
              </div>
              
              <div style={{ margin: "10px" }}>
                  <EditorReuse onContentChange={handleParagraph}/>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IP