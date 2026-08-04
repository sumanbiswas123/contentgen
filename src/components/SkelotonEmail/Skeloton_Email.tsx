import React from "react";

function Skeloton_Email() {
  let SkelotonPreview = `<html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <style>
            body {
                margin: 0;
                background: #f2f2f2;
                font-family: helvetica;
            }
    
            table {
                border: 0;
                border: none;
                border-spacing: none;
                border-spacing: 0;
                padding: 0;
            }
    
            td {
                padding: 0;
            }
    
            .outer-table {
                width: 600;
            }
    
            .main-gutter {
                width: 20px;
                background: white;
            }
    
            .main-container {
                width: 560px;
            }
    
            .is-white-bg {
                background: #fff;
            }
    
            .is-gold {
                color: #C49859;
            }
    
            .is-gold-bg {
                background-color: #C49859;
            }
    
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            p {
                color: #444;
            }
    
            p {
                line-height: 2;
                letter-spacing: 1px;
                font-weight: 500;
            }
    
            .tiny-text {
                font-size: 11px;
                line-height: 1.6;
            }
    
            img {
                display: block;
                border: 0;
                line-height: 0px;
                font-size: 0px;
                margin: 0;
                padding: 0;
            }
    
            a {
                color: black;
                text-decoration: none;
            }
    
            .footer {
                color: #999;
                font-weight: lighter;
                font-size: 13px;
            }
        </style>
    </head>
    
    <body>
        <center>
            <table width="600">
                <tr>
                    <td width="600" bgcolor="white">
                        <!-- spacer -->
                        <table height="10" width="600" bgcolor="eeeeee">
                            <tr>
                                <td height="10" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <table width="600" valign="top" bgcolor="eeeeee">
                            <tr>
                                <td width="30"></td>
                                <td width="140" mc:edit="logo"><img src="http://via.placeholder.com/140x65.jpg" alt="" width="140"></td>
                                <td width="250"></td>
                                <td width="150" align="right" class="view-in-browser">
                                    <a href="">View in Browser</a>
                                </td>
                                <td width="30"></td>
                            </tr>
                        </table>
    
                        <!-- spacer -->
                        <table height="10" width="600" bgcolor="eeeeee">
                            <tr>
                                <td height="10" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <!-- spacer -->
                        <table height="80" width="600">
                            <tr>
                                <td height="80" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <!-- is card -->
                        <table width="600">
                            <tr>
                                <td width="60">&nbsp;</td>
                                <td width="478">
                                    <table width="478" style="border:1px solid #eeeeee;">
                                        <tr>
                                            <td width="478" mc:edit="section_one_img">
                                                <img src="http://via.placeholder.com/478x350.jpg" alt="" mc:edit="section_one_img">
                                            </td>
                                        </tr>
                                        <tr height="15" width="478">
                                            <td height="15" width="478">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="478">
                                                <table width="478">
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438" align="center" mc:edit="section_one">
                                                            <h1>This is a Section Title</h1>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae unde, vitae repellendus, ex dolores ipsum. Repellat ipsa modi eos suscipit, eligendi, minima illo, voluptatem enim rerum quam, atque officiis blanditiis.</p>
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438">
                                                            <table width="438" align="center">
                                                                <tr>
                                                                    <td height="20">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td width="180" align="center" mc:edit="section_one_cta">
                                                                        <center>
                                                                            <a href="https://kennykrosky.com" style="background-color:#EB7035;border:1px solid #EB7035;border-radius:3px;color:#ffffff;display:inline-block;line-height:64px;text-align:center;text-decoration:none;width:180px;-webkit-text-size-adjust:none;mso-hide:all;">Call To Action
                                                                        </a>
                                                                        </center>
                                                                    </td>
                                                                </tr>
                                                            </table>
    
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr height="35" width="478">
                                            <td height="35" width="478">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="60">&nbsp;</td>
                            </tr>
                        </table>
    
                        <!-- spacer -->
                        <table height="80" width="600">
                            <tr>
                                <td height="80" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <!-- is card -->
                        <table width="600">
                            <tr>
                                <td width="60">&nbsp;</td>
                                <td width="478">
                                    <table width="478" style="border:1px solid #eeeeee;">
                                        <tr>
                                            <td width="478">
                                                <img src="http://via.placeholder.com/478x350.jpg" alt="" mc:edit="section_two_img">
                                            </td>
                                        </tr>
                                        <tr height="15" width="478">
                                            <td height="15" width="478">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="478">
                                                <table width="478">
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438" align="center" mc:edit="section_two">
                                                            <h1>This is a Section Title</h1>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae unde, vitae repellendus, ex dolores ipsum. Repellat ipsa modi eos suscipit, eligendi, minima illo, voluptatem enim rerum quam, atque officiis blanditiis.</p>
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438">
                                                            <table width="438" align="center">
                                                                <tr>
                                                                    <td height="20">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td width="180" align="center" mc:edit="section_two_cta">
                                                                        <center>
                                                                            <a href="https://kennykrosky.com" style="background-color:#EB7035;border:1px solid #EB7035;border-radius:3px;color:#ffffff;display:inline-block;line-height:64px;text-align:center;text-decoration:none;width:180px;-webkit-text-size-adjust:none;mso-hide:all;">Call To Action
                                                                        </a>
                                                                        </center>
                                                                    </td>
                                                                </tr>
                                                            </table>
    
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr height="35" width="478">
                                            <td height="35" width="478">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="60">&nbsp;</td>
                            </tr>
                        </table>
    
                        <!-- spacer -->
                        <table height="80" width="600">
                            <tr>
                                <td height="80" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <!-- is card -->
                        <table width="600">
                            <tr>
                                <td width="60">&nbsp;</td>
                                <td width="478">
                                    <table width="478" style="border:1px solid #eeeeee;">
                                        <tr>
                                            <td width="478">
                                                <img src="http://via.placeholder.com/478x350" alt="" mc:edit="section_three_img">
                                            </td>
                                        </tr>
                                        <tr height="15" width="478">
                                            <td height="15" width="478">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="478">
                                                <table width="478">
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438" align="center" mc:edit="section_three">
                                                            <h1>This is a Section Title</h1>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae unde, vitae repellendus, ex dolores ipsum. Repellat ipsa modi eos suscipit, eligendi, minima illo, voluptatem enim rerum quam, atque officiis blanditiis.</p>
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                    <tr>
                                                        <td width="20">&nbsp;</td>
                                                        <td width="438">
                                                            <table width="438" align="center">
                                                                <tr>
                                                                    <td height="20">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td width="180" align="center" mc:edit="section_three_cta">
                                                                        <center>
                                                                            <a href="https://kennykrosky.com" style="background-color:#EB7035;border:1px solid #EB7035;border-radius:3px;color:#ffffff;display:inline-block;line-height:64px;text-align:center;text-decoration:none;width:180px;-webkit-text-size-adjust:none;mso-hide:all;">Call To Action
                                                                        </a>
                                                                        </center>
                                                                    </td>
                                                                </tr>
                                                            </table>
    
                                                        </td>
                                                        <td width="20">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr height="35" width="478">
                                            <td height="35" width="478">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="60">&nbsp;</td>
                            </tr>
                        </table>
    
                        <!-- spacer -->
                        <table height="80" width="600">
                            <tr>
                                <td height="80" line-height="10px" width="600"></td>
                            </tr>
                        </table>
    
                        <table width="600" bgcolor="EEEEEE" class="footer">
                            <tr>
                                <td width="30" bgcolor="EEEEEE"></td>
                                <td width="540" bgcolor="EEEEEE">
                                    <table width="540" bgcolor="EEEEEE">
                                        <tr height="60">
                                            <td width="540" height="60" bgcolor="EEEEEE">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="540" align="center" bgcolor="EEEEEE">
                                                Company &copy;
                                            </td>
                                        </tr>
                                        <tr height="10">
                                            <td width="540" height="10" bgcolor="EEEEEE">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="540" align="center" bgcolor="EEEEEE">social media</td>
                                        </tr>
                                        <tr height="10">
                                            <td width="540" height="10" bgcolor="EEEEEE">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="540" align="center" bgcolor="EEEEEE">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur repellendus natus atque ratione, et, repellat.</td>
                                        </tr>
                                        <tr height="10">
                                            <td width="540" height="10" bgcolor="EEEEEE">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td width="540" align="center" bgcolor="EEEEEE">
                                                <a href="">Settings</a> &nbsp;| <a href="">Unsubscribe</a>
                                            </td>
                                        </tr>
                                        <tr height="50">
                                            <td width="540" height="50" bgcolor="EEEEEE">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                                <td width="30" bgcolor="EEEEEE"></td>
                            </tr>
    
                        </table>
    
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>`;
  return (
    <iframe
      style={{ width: "100%", height: "100%" }}
      srcDoc={SkelotonPreview}
      width="600"
      height="800"
      className="previewbox"
      title="email_preview"
    ></iframe>
  );
}

export default Skeloton_Email;
