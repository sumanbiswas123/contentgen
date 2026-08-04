import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import Windows from "./Windows";
import "./SavedTemplate.css";
import { useNavigate } from "react-router-dom";
import {
  getBody,
  getFooter,
  getHeader,
  getPM,
  getPreHeader,
  getServerImages,
  getSubjectLine,
} from "../../Redux/ProductReducer/action";
import TemplateSearch from "./SearchTemplate";
import PreviewEmailMode from "./PreviewEmailMode";
import { MdDeleteForever } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { MdNavigateNext } from "react-icons/md";
import { IoExpand } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

const SavedTemplate: React.FC = () => {
  const [template, setTemplate] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
  });
  const [searching, setSearching] = useState<boolean>(false);
  const [isPageNoLoading, setPageNoLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const HandleuseTemplate = (e: any) => {
    setLoading(true);
    localStorage.setItem("body", JSON.stringify(e.body || []));
    localStorage.setItem("header", e.header || "");
    localStorage.setItem("footer", e.footer || "");
    localStorage.setItem("preheader", e.preheader || "");
    localStorage.setItem("subjectline", e.subjectline || "");
    localStorage.setItem("pmdate", e.pmdate || "");
    localStorage.setItem("mailImages", JSON.stringify(e.mailImages || []));

    dispatch(getBody(e.body));
    dispatch(getHeader(e.header));
    dispatch(getFooter(e.footer));
    dispatch(getPreHeader(e.preheader));
    dispatch(getSubjectLine(e.subjectline));
    dispatch(getPM(e.pmdate));
    dispatch(getServerImages(e.mailImages));
    setLoading(false);
    navigate("/");
  };

  const closeModal = () => {
    setModalOpen(false);
    setPreviewEmail(null);
    document.body.classList.remove("modal-blur-active");
    try {
      if (typeof (window as any).sync_child_bounds === "function") {
        (window as any).sync_child_bounds("0,0,0,0,false");
      }
      const editorChannel = new BroadcastChannel("editor_channel");
      editorChannel.postMessage({ type: "close-saved-template-modal" });
      editorChannel.close();
    } catch (err) {}
  };

  const PreviewMode = (e: any) => {
    setPreviewEmail(e);
    setModalOpen(true);
    document.body.classList.add("modal-blur-active");
    try {
      if (typeof (window as any).sync_child_bounds === "function") {
        (window as any).sync_child_bounds("0,0,0,0,false");
      }
      const editorChannel = new BroadcastChannel("editor_channel");
      editorChannel.postMessage({ type: "open-saved-template-modal", blur: true });
      editorChannel.close();
    } catch (err) {}
  };

  const hanldeFilterdData = (filtered: any, query: string, status: boolean) => {
    if (status === false) {
      setPageNoLoading(false);
      alert("Something went wrong with the server.");
      return;
    }
    setSearching(query && query.length > 0 ? true : false);
    setTemplate(filtered.templates);
    setPagination({
      ...pagination,
      totalPages: filtered.totalPages,
      currentPage: filtered.currentPage,
    });
    setPageNoLoading(false);
  };

  const handleDeleteTemplate = (e: any) => {
    axios
      .delete(`${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/templates/${e.PmId}`)
      .then(() => {
        getData();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const getData = () => {
    axios
      .get(
        `${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/templates?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`
      )
      .then((res) => {
        const templates = res.data.templates.reverse();
        setTemplate(templates);
        setPagination({
          ...pagination,
          totalPages: res.data.totalPages,
        });
      })
      .catch((err) => {
        console.error("Error fetching templates from server:", err.message);
      });
  };

  useEffect(() => {
    if (!searching) getData();
  }, [pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    setPageNoLoading(true);
    setPagination({
      ...pagination,
      currentPage: newPage,
    });
  };

  const handleClearSearch = () => {
    setSearching(false);
    getData();
  };

  return (
    <div className="saved-templates-wrapper">
      <div className="saved-templates-header">
        <TemplateSearch
          onContentChange={hanldeFilterdData}
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          searchValue={searchQuery}
          onChange={setSearchQuery}
          onClear={handleClearSearch}
        />
      </div>

      <div className="templates-grid-view">
        {template.length === 0 && (
          <div className="templates-loading-placeholder">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="template-skeleton-box">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
              </div>
            ))}
          </div>
        )}

        <div className="templates-items-flex">
          {template && template.length > 0 && template.map((e: any, index: number) => (
            <div key={index} className="template-card-container" onClick={() => PreviewMode(e)} title="Click to view template details">
              {/* Clean Header: Full PM ID spanning whole single line */}
              <div className="preview-action-overlay">
                <div className="template-card-title-area" title={e.PmId}>
                  <span className="template-pm-id">{e.PmId}</span>
                </div>
              </div>

              {/* Clickable Email Preview Body */}
              <div className="template-card-preview-body">
                <Windows templateData={e} />
              </div>

              {/* Clean Footer: Modified By User + Delete */}
              <div className="template-card-badges">
                <span className="badge badge-text" title={`Modified by ${e.User}`}>
                  By: {e.User?.split("@")[0]}
                </span>
                <button
                  className="btn-delete-template"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    handleDeleteTemplate(e);
                  }}
                  title="Delete Template"
                >
                  <MdDeleteForever />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Sticky Pagination Controls at Bottom */}
      <div className="pagination-bar-wrapper">
        <button
          className="btn-pagination"
          disabled={pagination.currentPage === 1 || isPageNoLoading}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          title="Previous Page"
        >
          <GrFormPrevious size={18} />
        </button>

        <span className="pagination-label">
          {pagination.currentPage} / {pagination.totalPages}
        </span>

        <button
          className="btn-pagination"
          disabled={pagination.currentPage === pagination.totalPages || isPageNoLoading}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          title="Next Page"
        >
          <MdNavigateNext size={18} />
        </button>
      </div>

      {/* Glassmorphic Beautiful Dialog Modal for Email Preview - Portaled directly to document.body */}
      {isModalOpen && previewEmail && ReactDOM.createPortal(
        <div className="modal-dialog-overlay" onClick={closeModal}>
          <div className="modal-dialog-content-full glass-modal-card" onClick={(evt) => evt.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-title-box">
                <h3 className="modal-template-id">{previewEmail.PmId}</h3>
                <span className="modal-author-badge">Last modified by: {previewEmail.User}</span>
              </div>
              <div className="modal-header-actions">
                <button
                  className="btn-modal-use-template"
                  onClick={() => {
                    closeModal();
                    HandleuseTemplate(previewEmail);
                  }}
                >
                  <FaRegEdit /> Load & Edit Template
                </button>
                <button className="btn-modal-close" onClick={closeModal} title="Close">✘</button>
              </div>
            </div>
            <div className="modal-dialog-body">
              <PreviewEmailMode
                templateData={previewEmail}
                onUseTemplate={() => {
                  closeModal();
                  HandleuseTemplate(previewEmail);
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SavedTemplate;
