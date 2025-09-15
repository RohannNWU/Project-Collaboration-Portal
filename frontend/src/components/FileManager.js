import React, { useState } from "react";
import styles from "./FileManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faDownload,
  faTrashAlt,
  faUpload,
  faEdit,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const FileManager = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([
    { id: 1, name: "Technical-Spec.docx" },
    { id: 2, name: "Functional-Spec.docx" },
    { id: 3, name: "Instructions.pdf" },
  ]);

  const handleDelete = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const handleRename = (id, newName) => {
    if (newName) {
      setFiles(
        files.map((file) =>
          file.id === id ? { ...file, name: newName } : file
        )
      );
    }
  };

  return (
    <div className={styles.fileManager}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className={styles.title}>Project Files</h2>
        <button className={styles.uploadBtn}>
          <FontAwesomeIcon icon={faUpload} /> Upload
        </button>
      </div>

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
                  onClick={() =>
                    handleRename(file.id, prompt("Enter new name:", file.name))
                  }
                />
              </td>
              <td className={styles.actions}>
                <button className={`${styles.iconBtn} ${styles.view}`}>
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button className={`${styles.iconBtn} ${styles.download}`}>
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

      <button className={styles.saveBtn}>Save</button>
    </div>
  );
};

export default FileManager;
