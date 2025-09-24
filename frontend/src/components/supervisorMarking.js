function toggleRolePanel() {
  const role = (document.getElementById("role") as HTMLInputElement).value;
  const supervisorPanel = document.getElementById("supervisorPanel");
  const studentPanel = document.getElementById("studentPanel");

  //supervisorPanel.classList.add("hidden");
  if (studentPanel) {
    studentPanel.classList.add("hidden");
  if (role === "supervisor") {
    //supervisorPanel.classList.remove("hidden");
  } else if (role === "student") {
    if (studentPanel) {
      studentPanel.classList.remove("hidden");
    }
  }
    studentPanel.classList.remove("hidden");
  }
}

function addTask() {
  alert("Task added successfully!");
}

function deleteTask() {
  alert("Task deleted.");
}
