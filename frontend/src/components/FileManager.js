import React, { useState } from "react";
import styles from "./FileManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUpload,
  faEye,
  faDownload,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const FileManager = () => {
  const [files, setFiles] = useState([
    { id: 1, name: "Technical-Spec.docx" },
    { id: 2, name: "Functional-Spec.docx" },
    { id: 3, name: "Instructions.pdf" },
    { id: 4, name: "Design-Mockups.zip" },
    { id: 5, name: "Project-Timeline.xlsx" },
  ]);

  const handleRename = (id) => {
    const file = files.find((f) => f.id === id);
    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
      setFiles(
        files.map((file) =>
          file.id === id ? { ...file, name: newName } : file
        )
      );
    }
  };

  const handleDelete = (id) => {
    const file = files.find((f) => f.id === id);
    const confirmed = window.confirm(`Delete "${file.name}"?`);
    if (confirmed) {
      setFiles(files.filter((file) => file.id !== id));
    }
  };

  const handleUpload = () => {
    alert("Upload clicked (connect to backend later)");
  };

  const handleView = (file) => {
    alert(`Viewing file: ${file.name}`);
  };

  const handleDownload = (file) => {
    alert(`Downloading file: ${file.name}`);
  };

  const handleSave = () => {
    alert("Changes saved! (hook this to backend)");
  };

  return (
    <div className={styles.fileManager}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Project Files</h2>
        <button className={styles.uploadBtn} onClick={handleUpload}>
          <FontAwesomeIcon icon={faUpload} /> Upload
        </button>
      </div>

      {/* File Table */}
      <table className={styles.fileTable}>
        <thead>
          <tr>
            <th>File Name</th>
            <th className={styles.actions}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>
                <span className={styles.fileName}>{file.name}</span>
                <FontAwesomeIcon
                  icon={faEdit}
                  className={styles.renameIcon}
                  title="Rename"
                  onClick={() => handleRename(file.id)}
                />
              </td>
              <td className={styles.actions}>
                <button
                  className={`${styles.iconBtn} ${styles.view}`}
                  onClick={() => handleView(file)}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.download}`}
                  onClick={() => handleDownload(file)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.delete}`}
                  onClick={() => handleDelete(file.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Save Button */}
      <button className={styles.saveBtn} onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default FileManager;
