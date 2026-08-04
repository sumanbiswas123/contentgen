import React, { useState } from "react";
import I2CTAimg from "./Thumbs/I2CTA.png";
import ImageReusable from "../../EditorSkills/ImageReusable";
import EditorReuse from "../../EditorSkills/EditorReusable";
import { useDispatch } from "react-redux";
import { getI2cta } from "../../../Redux/ProductReducer/action";
import ImageGallery from "../../ImageBucket/ImageGallery";

const I2CTA = () => {
  const dispatch = useDispatch();
  const [isOpenI2CTAModal, setOpenI2CTAModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [imgName, setimgName] = useState("");
  const [imagePath, setImagePath] = useState(null); // Image path to be displayed
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    imageAltText: "",
    imgWidth: "",
    imgBackgroundLink: "",
    cta1Text: "",
    cta1Link: "",
    cta1Color: "",
    cta1BgColor: "",
    cta2Text: "",
    cta2Link: "",
    cta2Color: "",
    cta2BgColor: "",
  });

  let i2ctahtml = `<tr>
  <td align="left" valign="top" style="padding-bottom: 20px" bgcolor="#FFFFFF">
    <table
      role="presentation"
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
    >
      <tbody>
        <tr>
          <td class="col-100" align="center" valign="top">
            <table
              role="presentation"
              align="center"
              width="100%"
              border="0"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td
                    class="hero_image"
                    style="font-size: 0%; background-color: #ffffff"
                  >
                    <img
                      src="${imagePath}"
                      width="${formData.imgWidth}"
                      height="auto"
                      alt="${formData.imageAltText}"
                      aria-hidden="true"
                      style="
                        display: inline-block;
                        border: none;
                        color: #151515;
                        font-size: 12px;
                        line-height: 30px;
                        font-style: italic;
                        font-weight: normal;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td
            class="blockSpace"
            width="10"
            align="left"
            valign="top"
            bgcolor="#FFFFFF"
          >
            &nbsp;
          </td>

          <td
            class="col-100"
            width="355"
            align="left"
            valign="middle"
            bgcolor="ffffff"
          >
            <table
              role="presentation"
              align="center"
              width="100%"
              border="0"
              cellspacing="0"
              cellpadding="0"
            >
              <tbody>
                <tr>
                  <td class="col-100" align="center" valign="middle">
                    <table
                      width="298"
                      border="0"
                      cellspacing="0"
                      cellpadding="0"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="middle">
                            <table
                              width=""
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                              role="presentation"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    bgcolor="${formData.cta1BgColor}"
                                    style="padding: 10px 15px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="center"
                                            valign="middle"
                                            style="
                                              font-family: Arial;
                                              font-size: 16px;
                                              font-weight: bold;
                                              line-height: 22px;
                                              padding: 0 2px;
                                            "
                                          >
                                            <a
                                              target="_blank"
                                              style="
                                          color: ${formData.cta1Color};
                                          text-decoration: none;
                                      "
                                              href="${formData.cta1Link}"
                                            >
                                              ${formData.cta1Text}
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>

                                <!-- Spacing -->
                                <tr>
                                  <td
                                    bgcolor="#ffffff"
                                    style="padding: 10px 15px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="center"
                                            valign="middle"
                                            style="
                                              font-family: Arial;
                                              font-size: 16px;
                                              font-weight: bold;
                                              line-height: 22px;
                                              padding: 0 2px;
                                            "
                                          ></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <!-- Spacing end -->
                                <!-- CTA 2 -->
                                <tr>
                                  <td
                                    bgcolor="${formData.cta2BgColor}"
                                    style="padding: 10px 15px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="center"
                                            valign="middle"
                                            style="
                                              font-family: Arial;
                                              font-size: 16px;
                                              font-weight: bold;
                                              line-height: 22px;
                                              padding: 0 2px;
                                            "
                                          >
                                            <a
                                              target="_blank"
                                              style="
                                                                  color: ${formData.cta2Color};
                                                                  text-decoration: none;
                                                                "
                                              href="${formData.cta2Link}"
                                            >
                                              ${formData.cta2Text}
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <!-- CTA closing 2 -->
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`;

  const handleImageLoad = () => {
    // Construct the image path based on the user input
    setGallery(true);
  };

  const HandleGalleryClose = (value, imgname) => {
    setimgName(imgname);
    setGallery(value);
    const imageURL = `${process.env.REACT_APP_SERVER_URL}/assets/${imgname}`;
    // setImgURL(img);
    // Update the state with the image path
    setImagePath(imageURL);
  };

  const openI2CTAModal = () => {
    setOpenI2CTAModal(true);
  };
  const closeI2CTAModal = () => {
    setOpenI2CTAModal(false);
  };

  const handleToggle = () => {
    setIsChecked((prev) => !prev);
  };

  const handleI2CTAcode = (e) => {
    e.preventDefault();

    // console.log("clicked");

    // console.log(formData);
    dispatch(getI2cta({ type: "I2CTA", code: i2ctahtml }));
    closeI2CTAModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImage = () => {};
  const handleParagraph = () => {};

  return (
    <div>
      <div
        className="component-card"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          padding: "5px",
          margin: "10px",
        }}
      >
        <img
          src={I2CTAimg}
          alt="SpeakerModule.png"
          style={{ width: "100%", height: "70px", cursor: "pointer" }}
          onClick={openI2CTAModal}
        />
        <div
          className="component-heading"
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center" as const,
            color: "#151515",
            backgroundColor: "#f0efed",
            padding: "5px",
            marginTop: "5px",
          }}
        >
          I2CTA Module
        </div>
      </div>
      
      {isOpenI2CTAModal && (
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
                {/* <label style={{ display: "flex", alignItems: "center" as const, gap: "8px" }}>
                  <input type="checkbox" checked={isChecked} onChange={handleToggle} />
                  change Image left to right
                </label> */}
              </div>
              <button onClick={closeI2CTAModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleI2CTAcode}>
                <div style={{ marginBottom: "15px" }}>
                  <input
                    id="ThemeButtonSave"
                    type="submit"
                    value="Create I2CTA Module"
                    style={{
                      background: "blue",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <div className="tabs" style={{ display: "flex", borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
                    <div
                      style={{ flex: 1, textAlign: "center" as const, padding: "10px", cursor: "pointer", fontWeight: "bold", borderBottom: activeTab === 0 ? "2px solid blue" : "none" }}
                      onClick={() => setActiveTab(0)}
                    >
                      Image
                    </div>
                    <div
                      style={{ flex: 1, textAlign: "center" as const, padding: "10px", cursor: "pointer", fontWeight: "bold", borderBottom: activeTab === 1 ? "2px solid blue" : "none" }}
                      onClick={() => setActiveTab(1)}
                    >
                      CTA 1
                    </div>
                    <div
                      style={{ flex: 1, textAlign: "center" as const, padding: "10px", cursor: "pointer", fontWeight: "bold", borderBottom: activeTab === 2 ? "2px solid blue" : "none" }}
                      onClick={() => setActiveTab(2)}
                    >
                      CTA 2
                    </div>
                  </div>

                  <div className="tab-content">
                    {activeTab === 0 && (
                      <div>
                        <button
                          id="ThemeButtonSave"
                          type="button"
                          onClick={() => handleImageLoad()}
                          style={{ border: "none", width: "100%", padding: "8px 16px", background: "#e2e8f0", cursor: "pointer", marginBottom: "10px" }}
                        >
                          Select Image
                        </button>
                        {imgName && <label className="labels" style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
                        {imgName && (
                          <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "10px" }}>
                            <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`} width="150" height="150" alt="Preview" />
                          </div>
                        )}
                        <input
                          placeholder="img alt text"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="imageAltText"
                          required
                          className="InputBox"
                        />
                        <input
                          type="number"
                          min={0}
                          max={280}
                          placeholder="img width"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="imgWidth"
                          className="InputBox"
                        />
                        <input
                          placeholder="img background link"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="imgBackgroundLink"
                          className="InputBox"
                        />
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div>
                        <input
                          placeholder="Cta text"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta1Text"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta link"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta1Link"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta color"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta1Color"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta background color"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta1BgColor"
                          className="InputBox"
                        />
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div>
                        <input
                          placeholder="Cta text"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta2Text"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta link"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta2Link"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta color"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta2Color"
                          className="InputBox"
                        />
                        <input
                          placeholder="Cta background color"
                          style={{ width: "100%", padding: "8px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                          onChange={(e) => handleInputChange(e)}
                          name="cta2BgColor"
                          className="InputBox"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {gallery && <ImageGallery isOpenstatus={gallery} onGalleryClose={HandleGalleryClose} />}
    </div>
  );
};

export default I2CTA;
