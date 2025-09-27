import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./MessageTeams.module.css";

function MessageTeams() {
    const location = useLocation();
    const navigate = useNavigate();
    const projects = location.state?.projects || [];

    return (
        <div className={styles.container}>
            <h2>Select a Project to Message</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Project ID</th>
                        <th>Name</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.project_id}>
                            <td>{project.project_id}</td>
                            <td>{project.project_name}</td>
                            <td>
                                <button className={styles.msgBtn} onClick={() =>
                                    navigate("/chatwindow", { state: { projectId: project.project_id }})
                                }>
                                    Message
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MessageTeams;