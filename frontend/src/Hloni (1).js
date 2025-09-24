
function initCharts() {
  // Weekly Progress Chart
  const ctx1 = document.getElementById("progressChart").getContext("2d");
  new Chart(ctx1, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Progress",
        data: [2, 4, 6, 5, 7, 8, 10],
        borderColor: "#16a085",
        backgroundColor: "rgba(22,160,133,0.1)",
        fill: true
      }]
    }
  });

  // Workload Chart
  const ctx2 = document.getElementById("workloadChart").getContext("2d");
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["Documentation", "Development", "Testing", "Research"],
      datasets: [{
        data: [30, 40, 20, 10],
        backgroundColor: ["#2980b9", "#16a085", "#f39c12", "#8e44ad"]
      }]
    }
  });
}

// Calendar Init
document.addEventListener("DOMContentLoaded", function() {
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: [
      { title: "CMPG 311 Due", start: "2025-09-21" },
      { title: "CMPG 323 Due", start: "2025-10-06" },
      { title: "CMPG 321 Due", start: "2025-11-11" }
    ]
  });
  calendar.render();
  initCharts();
  document.getElementById("year").textContent = new Date().getFullYear();
});

// Logout function
function logout() {
  alert("Logging out...");
}
