import React from 'react'
import "./Windows.css"



const Windows = ({templateData}) => {
    // console.log(templateData)

    let fullBOdy = ""
//   console.log(template.body)
templateData?.body.forEach((e)=>{
    // console.log(e.type)
    fullBOdy = fullBOdy + e.code
  })

      let std_temp =  `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${templateData?.subjectline}</title>
    <style type="text/css">
      /*Css Reset Start*/
      body,
      #body_style {
        width: 100% !important;
        background: #ffffff;
        font-family: Arial;
        color: #ffffff;
        line-height: 1;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass table,
      .ExternalClass div {
        line-height: 100%;
      }
      body {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
        margin: 0 !important;
      }
      body,
      img,
      div,
      p,
      ul,
      li,
      span,
      strong,
      a {
        margin: 0;
        padding: 0;
      }
      table {
        border-spacing: 0;
      }
      table td,
      table th {
        border-collapse: collapse;
      }
      div {
        margin: 0 !important;
        padding: 0 !important;
      }
      a {
        outline: none !important;
      }
      a[href^="tel"],
      a[href^="sms"] {
        text-decoration: none;
        color: inherit !important;
      }
      img {
        display: block !important;
        border: none !important;
        outline: none !important;
        text-decoration: none;
      }
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      .appleLinks {
        color: inherit;
        text-decoration: none;
      }
      .appleLinks a {
        color: inherit;
        text-decoration: none;
      }

      /* Scrollbar hiding styles */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      body {
        overflow-x: hidden !important;
      }
      table.Container {
        width: 100% !important;
        max-width: 100% !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      /*Css Reset End*/

      /*media query Start*/
      @media only screen and (max-width: 599px) {
        td[class="Wrapper"] table[class="Container"] {
          width: 100% !important;
        }
        td[class="Wrapper"] .hero_image img {
          width: 100% !important;
          height: auto !important;
        }
        .hideSpace {
          display: none !important;
        }
        .blockSpace {
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        *[class="gmail-fix"] {
          display: none !important;
        }
        td[class="Wrapper"] .col-100 {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          float: none !important;
        }
        td[class="Wrapper"] .col-50 {
          width: 50% !important;
          height: auto !important;
          float: none !important;
        }
        .brk_none br {
          display: none !important;
        }
        td[class="Wrapper"] .fragment_image img {
          width: 100% !important;
          height: auto !important;
        }
      }

      @media only screen and (max-width: 479px) {
        .setPadding {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }
        .blockSpace1 {
          width: 100% !important;
          height: 20px !important;
          display: block !important;
        }
        td[class="Wrapper"] .col-50 {
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        td[class="Wrapper"] .col-header {
          width: 100% !important;
          float: none !important;
          display: block !important;
        }
        table[class="dec_width"] {
          width: 280px !important;
        }
        img[class="rezize"] {
          width: 100% !important;
          height: auto !important;
        }
        .button_size {
          width: 100%;
        }
      }
      /*media query End*/
    </style>
  </head>
  <body
    style="
      font-family: Arial;
      font-size: 12px;
      font-weight: normal;
      color: #151515;
      background: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
    yahoo="fix"
  >
    <!--[if !mso 9]><!-->
    <div
    data-test="pre-header"
      style="
        display: none;
        font-size: 1px;
        color: #333333;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      ${templateData?.preheader}
    </div>
    <!--<![endif]-->
    <table
      width="100%"
      bgcolor="#F5F5F5"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
    >
      <tbody>
        <tr>
          <td class="Wrapper" align="center" valign="top">
            <!-- Main Wrapper -->

            <table
              bgcolor="#ffffff"
              class="Container"
              width="600"
              border="0"
              cellspacing="0"
              cellpadding="0"
              align="center"
              role="presentation"
            >
              <tbody>
                
              
            ${templateData?.header}
              ${fullBOdy}
              
              
              ${templateData?.footer}
              
              ${templateData?.pmdate}

               

                <!-- Gmail App Fix -->
                <tr class="gmail-fix">
                  <td>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="600"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f8f6f5"
                            height="1"
                            style="line-height: 1px; min-width: 600px"
                          >
                            <img
                              src="assets/trans.png"
                              width="600"
                              height="1"
                              alt=""
                              style="
                                display: block;
                                max-height: 1px;
                                min-height: 1px;
                                min-width: 600px;
                                width: 600px;
                              "
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Gmail App Fix End -->
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`

// console.log(std_temp)
  return (
    <div id="windows">
    <iframe srcDoc= {std_temp} width="100%" height="250" className="previewbox" title='email_preview'  ></iframe>

    </div>
  )
}

export default Windows