import axios from "axios";
import React, { useEffect, useState } from "react";

const useToast = () => {
    return (options) => {
        alert(`${options.title}\n${options.description || ''}`);
    };
};

const HeaderAdminBoard = () => {
  const [formData, setFormData] = useState({
    country: "",
    code: "",
  });
  const [deleteCountry, setDeleteCountry] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [arr, setArray] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const toast = useToast();

  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  const onOpenModal = () => {
    setIsModalOpen(true);
  };

  const onCloseDeleteModal = () => {
    setIsModalDeleteOpen(false);
  };

  const onOpenDeleteModal = () => {
    setIsModalDeleteOpen(true);
  };

  const onSend = () => {
    setisLoading(true);

    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/headerData`, formData)
      .then((res) => {
        setisLoading(false);
        toast({
          title: `Header ${formData.country} updated Successful`,
          description: "Your data has been successfully submitted.",
          status: "success",
          duration: 10000,
          isClosable: true,
        });
        onCloseModal();
      })
      .catch((err) => {
        setisLoading(false);
        toast({
          title: "Error",
          description: "There was an error processing your request.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onCloseModal();
      });
  };

  const onDelete = () => {
    setisLoading(true);
    axios
      .delete(`${process.env.REACT_APP_SERVER_URL}/headerData/${deleteCountry}`)
      .then((res) => {
        setisLoading(false);
        toast({
          title: `Header ${formData.country} Deleted Successful`,
          description: "Your data has been successfully submitted.",
          status: "success",
          duration: 10000,
          isClosable: true,
        });
        onCloseDeleteModal();
      })
      .catch((err) => {
        setisLoading(false);
        toast({
          title: "Error",
          description: "There was an error processing your request.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        onCloseDeleteModal();
      });
  };

  const container = {
    width: "70%",
    height: "70vh",
    display: "flex",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    margin: "auto",
    marginTop: "15vh",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
    borderRadius: "10px",
  };

  const handleinputs = (e) => {
    var { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmitHeader = (e) => {
    e.preventDefault();
    onOpenModal();
  };

  const handleDeleteHeader = (e) => {
    e.preventDefault();
    onOpenDeleteModal();
  };

  if (Array.isArray(arr)) arr.sort((a, b) => a.country.localeCompare(b.country));

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/Header`)
      .then((res) => {
        setArray(res.data.headers || []);
      })
      .catch((err) => {
      });
  }, [arr]);

  return (
    <div style={container}>
      <div style={{ width: "100%" }}>
        <div style={{ margin: "10px", width: "100%" }}>
          <div className="tabs-container" style={{ width: "100%" }}>
            <div className="flex-row-wrap" style={{ display: "flex", width: "100%", marginBottom: "20px" }}>
              <button style={{ width: "50%", fontWeight: "bold", padding: "10px", backgroundColor: activeTab === 0 ? "#eee" : "transparent", border: "none", cursor: "pointer" }} onClick={() => setActiveTab(0)}>
                Update Or Add Header
              </button>
              <button style={{ width: "50%", fontWeight: "bold", padding: "10px", backgroundColor: activeTab === 1 ? "#eee" : "transparent", border: "none", cursor: "pointer" }} onClick={() => setActiveTab(1)}>
                Delete Header
              </button>
            </div>

            <div className="tab-panels">
              {activeTab === 0 && (
              <div className="tab-panel">
                <form onSubmit={handleSubmitHeader} style={{ display: "flex", flexDirection: "column" as const }}>
                  <input
                    type="submit"
                    style={{ backgroundColor: "blue", color: "#ffffff", marginBottom: "50px", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                  />
                  <input
                    className="input-custom-field"
                    placeholder="countrycode_branded"
                    style={{ marginTop: "5px", padding: "10px" }}
                    name="country"
                    required
                    onChange={(e) => handleinputs(e)}
                  />
                  <textarea
                    className="input-custom-field"
                    placeholder="Header html code"
                    style={{ marginTop: "5px", padding: "10px", minHeight: "100px" }}
                    name="code"
                    required
                    onChange={(e) => handleinputs(e)}
                  />
                </form>
              </div>
              )}
              {activeTab === 1 && (
              <div className="tab-panel">
                <form onSubmit={handleDeleteHeader} style={{ display: "flex", flexDirection: "column" as const }}>
                  <input
                    type="submit"
                    style={{ backgroundColor: "red", color: "#ffffff", marginBottom: "50px", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    value="Delete"
                  />
                  <select
                    className="input-custom-field"
                    name="headers"
                    value={deleteCountry}
                    onChange={(e) => setDeleteCountry(e.target.value)}
                    style={{ backgroundColor: "#ffffff", textAlign: "center" as const, fontWeight: "bold", padding: "10px" }}
                  >
                    <option value="">
                      Select Header
                    </option>
                    {arr.map(function (ele, i) {
                      return (
                        <option key={i} value={ele.country}>
                          {" "}
                          {ele.country}
                        </option>
                      );
                    })}
                  </select>
                </form>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
      <div className="modal-dialog-overlay" style={{ position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const }}>
        <div className="modal-content" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", minWidth: "300px" }}>
          <div className="modal-header" style={{ display: "flex", justifyContent: "space-between" as const, fontSize: "1.2em", fontWeight: "bold", marginBottom: "15px" }}>
            <span>Confirm Update</span>
            <button onClick={onCloseModal} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.2em" }}>&times;</button>
          </div>
          <div className="modal-body" style={{ marginBottom: "20px" }}>
            Are you sure you want to update{" "}
            <b style={{ color: "red" }}>{formData.country}</b> footer?
          </div>
          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
            <button className="btn-accent" style={{ backgroundColor: "blue", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={onCloseModal}>
              Cancel
            </button>
            <button
              className="btn-accent"
              style={{ backgroundColor: "red", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}
              onClick={onSend}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
      )}

      {isModalDeleteOpen && (
      <div className="modal-dialog-overlay" style={{ position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const }}>
        <div className="modal-content" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", minWidth: "300px" }}>
          <div className="modal-header" style={{ display: "flex", justifyContent: "space-between" as const, fontSize: "1.2em", fontWeight: "bold", marginBottom: "15px" }}>
            <span>Confirm Delete</span>
            <button onClick={onCloseDeleteModal} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.2em" }}>&times;</button>
          </div>
          <div className="modal-body" style={{ marginBottom: "20px" }}>
            Are you sure you want to Delete{" "}
            <b style={{ color: "red" }}>{deleteCountry}</b> footer?
          </div>
          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end" as const, gap: "10px" }}>
            <button className="btn-accent" style={{ backgroundColor: "blue", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={onCloseDeleteModal}>
              Cancel
            </button>
            <button
              className="btn-accent"
              style={{ backgroundColor: "red", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" }}
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default HeaderAdminBoard;
