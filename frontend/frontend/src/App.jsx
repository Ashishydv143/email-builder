import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPalette } from "react-icons/fa";
import "./App.css";

const App = () => {
  const [layoutHtml, setLayoutHtml] = useState("");
  const [emailConfig, setEmailConfig] = useState({
    title: "",
    heading: "",
    content: "",
    imageUrl: "",
    logoUrl: "",
    titleColor: "#ffffff",
    headingColor: "#ffffff",
    contentColor: "#ffffff",
    textSize: "16px",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    themeColor: "#000000",
  });
  const [showStyleBox, setShowStyleBox] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/getEmailLayout")
      .then((response) => {
        setLayoutHtml(response.data);
      })
      .catch((error) => {
        console.error("Error fetching layout:", error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (style) => {
    setEmailConfig((prev) => ({ ...prev, [style]: !prev[style] }));
  };

  const handleRemoveStyles = () => {
    setEmailConfig((prev) => ({
      ...prev,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      titleColor: "#ffffff",
      contentColor: "#ffffff",
      headingColor: "#ffffff",
      textSize: "16px",
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    axios
      .post("http://localhost:5000/api/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const uploadedUrl = `http://localhost:5000${response.data.path}`;
        setEmailConfig((prev) => ({
          ...prev,
          [type]: uploadedUrl,
        }));
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  const handleDownloadTemplate = () => {
    const contentStyles = `
      color:${emailConfig.contentColor};
      font-size:${emailConfig.textSize};
      font-weight:${emailConfig.isBold ? "bold" : "normal"};
      font-style:${emailConfig.isItalic ? "italic" : "normal"};
      text-decoration:${emailConfig.isUnderline ? "underline" : "none"};
    `;
    const titleStyles = `color:${emailConfig.titleColor};`;
    const headingStyles = `color:${emailConfig.headingColor};`;
    const themeStyles = `
      :root {
        --primary-color: ${emailConfig.themeColor};
      }
    `;

    const htmlContent = layoutHtml
      .replace(
        "{{title}}",
        `<span style="${titleStyles}">${emailConfig.title}</span>`
      )
      .replace(
        "{{heading}}",
        `<span style="${headingStyles}">${emailConfig.heading}</span>`
      )
      .replace(
        "{{content}}",
        `<span style="${contentStyles}">${emailConfig.content}</span>`
      )
      .replace("{{imageUrl}}", emailConfig.imageUrl || "")
      .replace("{{logoUrl}}", emailConfig.logoUrl || "")
      .replace("</style>", `${themeStyles}</style>`);

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "emailTemplate.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="container">
      <div className="template-section">
        <h2>Template Preview</h2>
        <div
          className="template-preview"
          dangerouslySetInnerHTML={{
            __html: layoutHtml
              .replace(
                "{{title}}",
                `<span style="color:${emailConfig.titleColor};">${emailConfig.title}</span>`
              )
              .replace(
                "{{heading}}",
                `<span style="color:${emailConfig.headingColor};">${emailConfig.heading}</span>`
              )
              .replace(
                "{{content}}",
                `<span style="
                  color:${emailConfig.contentColor};
                  font-size:${emailConfig.textSize};
                  font-weight:${emailConfig.isBold ? "bold" : "normal"};
                  font-style:${emailConfig.isItalic ? "italic" : "normal"};
                  text-decoration:${
                    emailConfig.isUnderline ? "underline" : "none"
                  };
                ">${emailConfig.content}</span>`
              )
              .replace("{{imageUrl}}", emailConfig.imageUrl || "")
              .replace("{{logoUrl}}", emailConfig.logoUrl || ""),
          }}
        ></div>
      </div>
      <div>
        <div className="input-section">
          <h2>Customize Email</h2>
          <div className="input-group">
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              type="text"
              name="title"
              value={emailConfig.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              name="content"
              value={emailConfig.content}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="input-group">
            <label htmlFor="logoUpload">Upload Logo:</label>
            <input
              id="logoUpload"
              type="file"
              onChange={(e) => handleFileUpload(e, "logoUrl")}
            />
          </div>
          <div className="input-group">
            <label htmlFor="imageUpload">Upload Image:</label>
            <input
              id="imageUpload"
              type="file"
              onChange={(e) => handleFileUpload(e, "imageUrl")}
            />
          </div>
          <div className="input-group">
            <label htmlFor="themeColor">Theme Color:</label>
            <input
              id="themeColor"
              type="color"
              name="themeColor"
              value={emailConfig.themeColor}
              onChange={handleInputChange}
            />
          </div>

          <div className="style-box">
            <button
              className="style-box-btn"
              onClick={() => setShowStyleBox(!showStyleBox)}
            >
              <FaPalette /> Style Options
            </button>
            {showStyleBox && (
              <div className="style-options">
                <button onClick={() => handleStyleChange("isBold")}>
                  {emailConfig.isBold ? "Unbold" : "Bold"}
                </button>
                <button onClick={() => handleStyleChange("isItalic")}>
                  {emailConfig.isItalic ? "Unitalic" : "Italic"}
                </button>
                <button onClick={() => handleStyleChange("isUnderline")}>
                  {emailConfig.isUnderline ? "Remove Underline" : "Underline"}
                </button>
                <button onClick={handleRemoveStyles}>Reset</button>
              </div>
            )}
          </div>
        </div>

        <button className="download-btn" onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </div>
    </div>
  );
};

export default App;
