import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import "./downloadIndex.css";
import { useNavigate } from "react-router-dom";
import Makepdf from "./Makepdf";
import JSZip from "jszip";
import axios from "axios";
import SaveTemplate from "../SavedTemplate/SaveTemplate";
import {
  getBody,
  getCapsulTimer,
  getFooter,
  getHeader,
  getImages,
  getPM,
  getPreHeader,
  getServerImages,
  getSignature,
  getSubjectLine,
} from "../../Redux/ProductReducer/action";
import Cookies from "js-cookie";
import SendReview from "../Dashboards/SendReview";
import { Sun, Moon } from "lucide-react";

const DownloadIndex = () => {
  const Template = useSelector((selector: any) => selector.ProductReducer.Template);
  const { BrandThemeColor } = useSelector(
    (selector: any) => selector.ProductReducer
  );
  const { Images } = useSelector((selector: any) => selector.ProductReducer);

  const [imgurls, setImgUrls] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setisLoading] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const downloadHTML = () => {
    setIsExportMenuOpen(false);
    setisLoading(true);

    if (!isDownloading) {
      const Downloadable2 = Template.replace(
        new RegExp(`${process.env.REACT_APP_SERVER_URL}/`, "g"),
        ""
      );
      const Downloadable = Downloadable2.replace(
        /\${BrandThemeColor}/g,
        BrandThemeColor
      ).replace("logos/", "assets/");
      setIsDownloading(true);

      downloadZip(imgurls, Downloadable);
      setTimeout(() => {
        setIsDownloading(false);
        setisLoading(false);
      }, 1000);
    }
  };

  const handleExportPDF = () => {
    setIsExportMenuOpen(false);
    navigate("/pdf");
  };

  useEffect(() => {
    const ipcChannel = new BroadcastChannel("webview_ipc");
    ipcChannel.onmessage = (event) => {
      if (event.data.type === 'confirm-erase-action') {
        ClearLS();
      }
    };
    return () => ipcChannel.close();
  }, []);

  const onOpenDeleteModal = () => {
    if ((window as any).show_native_confirm) {
      (window as any).show_native_confirm(
        "Confirm Erase",
        "Are you sure you want to Start New Email? This will erase the current draft."
      );
    } else {
      if (confirm("Are you sure you want to Start New Email? This will erase the current draft.")) {
        ClearLS();
      }
    }
  };

  const ClearLS = () => {
    var keysToDelete = [
      "footer",
      "mailImages",
      "header",
      "preheader",
      "pmdate",
      "subjectline",
      "body",
      "mailHeaderImages",
      "mailFooterImages",
      "TrackerId",
      "CustomCss"
    ];

    for (var i = 0; i < keysToDelete.length; i++) {
      localStorage.removeItem(keysToDelete[i]);
    }
    localStorage.setItem("body", JSON.stringify([]));
    dispatch(getBody([]));
    dispatch(getFooter(""));
    dispatch(getHeader(""));
    dispatch(getPM(""));
    dispatch(getSubjectLine(""));
    dispatch(getPreHeader(""));
    dispatch(getImages(""));
    dispatch(getServerImages(""));
  };



  const downloadZip = async (imageUrls, Downloadable) => {
    let headerusedImages =
      JSON.parse(localStorage.getItem("mailHeaderImages") || "[]");
    let footerusedImages =
      JSON.parse(localStorage.getItem("mailFooterImages") || "[]");
    const zip = new JSZip();
    const folder = zip.folder("assets");

    const parser = new DOMParser();
    const doc = parser.parseFromString(Downloadable, "text/html");

    const imgElements = doc.querySelectorAll("img");
    const srcValues = Array.from(imgElements).map((img) =>
      img.getAttribute("src")
    );

    let modifiedSrcValues = srcValues.map((item) => {
      let img = item.split("/");
      let finalimg = img.reverse()[0];
      return finalimg;
    });

    const downloadPromises = modifiedSrcValues.map(async (imageUrl) => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/assets/${imageUrl}`
      );
      const arrayBuffer = await response.arrayBuffer();
      const filename = imageUrl.split("/").pop();
      folder.file(`${filename}`, arrayBuffer);
    });

    zip.file("index.html", Downloadable);
    await Promise.all(downloadPromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = "output.zip";
    downloadLink.click();
    setisLoading(false);
  };

  useEffect(() => {
    setImgUrls(Images);
  }, [Images]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  return (
    <div
      className="export-floating-container"
      style={{
        position: "fixed",
        top: "12px",
        right: "16px",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      <button
        onClick={toggleDarkMode}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle Theme"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-main)",
          border: "1px solid var(--border-color)",
          fontWeight: 700,
          padding: "8px 12px",
          height: "35px",
          display: "inline-flex" as const,
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: "999px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease"
        }}
      >
        {isDarkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
      </button>

      <button
        className="MenuButtons"
        style={{
          background: "var(--grad-brand)",
          color: "#ffffff",
          border: "none",
          fontWeight: 700,
          padding: "8px 18px",
          boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
          cursor: "pointer",
          borderRadius: "999px"
        }}
        onClick={() => setIsExportMenuOpen((prev) => !prev)}
        disabled={isLoading}
      >
        {isLoading ? "⏳ Exporting..." : "Export ▾"}
      </button>

      {/* Small Export Options Modal / Dropdown beneath button */}
      {isExportMenuOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          padding: "6px",
          minWidth: "160px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          zIndex: 999
        }}>
          <button
            onClick={downloadHTML}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-main)",
              textAlign: "left"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            📄 Export to HTML
          </button>
          
          <button
            onClick={handleExportPDF}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-main)",
              textAlign: "left"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            📕 Export to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadIndex;
