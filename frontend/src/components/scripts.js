/* ===== Your original mock data (unchanged) ===== */
const progressData = [
  { name: "Mon", progress: 20 },
  { name: "Tue", progress: 35 },
  { name: "Wed", progress: 40 },
  { name: "Thu", progress: 55 },
  { name: "Fri", progress: 70 },
  { name: "Sat", progress: 78 },
  { name: "Sun", progress: 82 },
];

const loadData = [
  { name: "Design", tasks: 6 },
  { name: "Frontend", tasks: 9 },
  { name: "Backend", tasks: 5 },
  { name: "Docs", tasks: 3 },
];

const projects = [
  {
    id: "PJT-214",
    title: "Campus Navigator App",
    course: "CMPG313",
    status: "On Track",
    progress: 68,
    due: "2025-09-15",
    members: ["JM","NK","RS"]
  },
  {
    id: "PJT-198",
    title: "Insurance DB System",
    course: "CMPG315",
    status: "At Risk",
    progress: 42,
    due: "2025-08-29",
    members: ["JM","TB"]
  },
  {
    id: "PJT-171",
    title: "FOL Tutor Comparison",
    course: "CMPG313",
    status: "Review",
    progress: 81,
    due: "2025-08-22",
    members: ["JM","LM","AR","KB"]
  }
];

const deadlines = [
  { id: 1, label: "Sprint Review #4", when: "Aug 20, 10:00" },
  { id: 2, label: "CMPG315: ERD Draft", when: "Aug 21, 14:30" },
  { id: 3, label: "Peer Assessment", when: "Aug 23, 09:00" },
];

const inbox = [
  { from: "Dr. Naidoo", snippet: "Please align your scope with the updated brief…", time: "2h" },
  { from: "Team – Navigator App", snippet: "Uploaded user stories to the board. Kindly review.", time: "5h" },
  { from: "Lerato", snippet: "Can you check auth error on staging?", time: "1d" }
];

const activities = [
  { who: "Nkosi", action: "pushed 3 commits to", what: "frontend/auth", ago: "12m" },
  { who: "Rudo", action: "commented on", what: "Task CMPG315-23", ago: "1h" },
  { who: "John", action: "created branch", what: "feature/kanban-dnd", ago: "3h" }
];

/* ===== Helpers ===== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function statusClass(s){
  if(s === "On Track") return "ontrack";
  if(s === "At Risk")  return "atrisk";
  if(s === "Review")   return "review";
  return "";
}

/* ===== KPIs ===== */
function updateKPIs(){
  $("#kpi-projects").textContent = projects.length;
  $("#kpi-tasks-week").textContent = deadlines.length;   // simple example
  $("#kpi-messages").textContent = inbox.length;
}

/* ===== Render Projects ===== */
function renderProjects(filter="all", search=""){
  const list = $("#projectList");
  list.innerHTML = "";
  const q = search.trim().toLowerCase();

  projects
    .filter(p => filter==="all" || p.status === filter)
    .filter(p => !q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.course.toLowerCase().includes(q))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "project-card";

      const left = document.createElement("div");
      left.className = "project-meta";
      left.innerHTML = `
        <div class="project-icon">📁</div>
        <div class="project-info">
          <h4>${p.title}</h4>
          <small>${p.course} · ${p.id}</small>
          <div class="progress" title="${p.progress}%">
            <span style="width:${p.progress}%"></span>
          </div>
        </div>
      `;

      const right = document.createElement("div");
      right.style.display = "grid"; right.style.gap = "8px"; right.style.justifyItems = "end";

      const pill = document.createElement("span");
      pill.className = `status ${statusClass(p.status)}`;
      pill.textContent = p.status;

      const due = document.createElement("small");
      due.style.color = "var(--nwu-grey)";
      due.textContent = `Due ${p.due}`;

      const members = document.createElement("div");
      members.style.display = "flex"; members.style.gap = "4px";
      p.members.forEach(m=>{
        const el = document.createElement("div");
        el.className = "avatar"; el.style.width = "28px"; el.style.height = "28px"; el.style.fontSize="11px";
        el.textContent = m;
        el.style.background = "var(--nwu-turquoise)";
        el.style.border = "2px solid #fff";
        members.appendChild(el);
      });

      const open = document.createElement("button");
      open.className = "icon-btn";
      open.textContent = "Open ↗";
      open.style.background = "var(--nwu-turquoise)";
      open.style.color = "#fff";
      open.addEventListener("click", ()=> alert(`Open ${p.title}`));

      right.append(pill, due, members, open);
      card.append(left, right);
      list.appendChild(card);
    });
}

/* ===== Filters & Search ===== */
function setupFilters(){
  $$(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects(btn.dataset.filter, $("#searchInput").value);
    });
  });
  $("#searchInput").addEventListener("input", (e)=>{
    const active = document.querySelector(".tab.active")?.dataset.filter || "all";
    renderProjects(active, e.target.value);
  });
}

/* ===== Right column lists ===== */
function renderDeadlines(){
  const ul = $("#deadlineList"); ul.innerHTML="";
  deadlines.forEach(d=>{
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.label}</strong><div style="color:var(--nwu-grey);font-size:12px">${d.when}</div>`;
    ul.appendChild(li);
  });
}

function renderActivity(){
  const ul = $("#activityList"); ul.innerHTML="";
  activities.forEach(a=>{
    const li = document.createElement("li");
    const initials = a.who[0] + a.who.slice(-1);
    li.innerHTML = `<div style="display:flex;align-items:center;gap:8px">
      <div class="avatar" style="width:28px;height:28px;font-size:11px;background:var(--nwu-purple)">${initials}</div>
      <div class="text-sm"><span style="font-weight:600">${a.who}</span> ${a.action} <span style="font-weight:600">${a.what}</span>
      <span style="color:var(--nwu-grey);font-size:12px"> · ${a.ago} ago</span></div>
    </div>`;
    ul.appendChild(li);
  });
}

function renderInbox(){
  const ul = $("#inboxList"); ul.innerHTML="";
  inbox.forEach(m=>{
    const li = document.createElement("li");
    li.innerHTML = `<p class="text-sm" style="font-weight:600">${m.from}</p>
      <p style="font-size:12px;color:#4b5563;margin-top:4px">${m.snippet}</p>
      <p style="font-size:12px;color:var(--nwu-grey);margin-top:2px">${m.time}</p>`;
    ul.appendChild(li);
  });
}

/* ===== Charts ===== */
function initCharts(){
  // Weekly Progress
  const ctx1 = document.getElementById("progressChart").getContext("2d");
  new Chart(ctx1, {
    type: "line",
    data: {
      labels: progressData.map(d=>d.name),
      datasets: [{
        label: "Progress (%)",
        data: progressData.map(d=>d.progress),
        borderColor: "#00889C",           // Turquoise
        backgroundColor: "rgba(0,136,156,.15)",
        tension:.35,
        fill:true,
        pointRadius:3
      }]
    },
    options: {
      plugins:{ legend:{ display:false }},
      scales:{ y:{ suggestedMin:0, suggestedMax:100 } }
    }
  });

  // Workload by Area
  const ctx2 = document.getElementById("workloadChart").getContext("2d");
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: loadData.map(d=>d.name),
      datasets: [{
        label: "Tasks",
        data: loadData.map(d=>d.tasks),
        backgroundColor: "#6C3D91",       // Purple
        borderRadius:8
      }]
    },
    options: {
      plugins:{ legend:{ display:false }},
      scales:{ y:{ beginAtZero:true } }
    }
  });
}

/* ===== Init ===== */
window.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("year").textContent = new Date().getFullYear();
  updateKPIs();
  renderProjects();
  setupFilters();
  renderDeadlines();
  renderActivity();
  renderInbox();
  initCharts();

  // Demo quick actions
  document.getElementById("qa-new-project").onclick = ()=>alert("New Project clicked");
  document.getElementById("qa-new-task").onclick = ()=>alert("New Task clicked");
  document.getElementById("qa-message-team").onclick = ()=>alert("Message Team clicked");
  document.getElementById("qa-upload").onclick = ()=>alert("Upload File clicked");
});

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');
    const loginButton = document.getElementById('loginButton');
    const toast = document.getElementById('toast');
    
    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isPassword = passwordInput.type === 'password';
            
            // Toggle the input type
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye', !isPassword);
            icon.classList.toggle('fa-eye-slash', isPassword);
            
            // Maintain focus on the input
            passwordInput.focus();
            
            // Move cursor to the end of the input
            const len = passwordInput.value.length;
            passwordInput.setSelectionRange(len, len);
        });
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Form submission handler
    function handleLogin(e) {
        e.preventDefault();
        
        // Show loading state
        const buttonText = loginButton.querySelector('span:first-child');
        const loadingSpinner = loginButton.querySelector('.loading-spinner');
        
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-flex';
        loginButton.disabled = true;
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberMe.checked;
        
        // Simple validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            resetButtonState();
            return;
        }
        
        // Simulate API call with timeout
        setTimeout(() => {
            // In a real app, you would make an actual API call here
            // For demo purposes, we'll just show a success message
            showToast('Welcome back! You have successfully logged in to the collaboration portal.', 'success');
            
            // Reset form and button state after a short delay
            setTimeout(() => {
                resetButtonState();
                // Redirect to dashboard or home page after successful login
                // window.location.href = 'dashboard.html';
            }, 1000);
            
        }, 1500);
    }
    
    // Reset button to its initial state
    function resetButtonState() {
        const buttonText = loginButton.querySelector('span:first-child');
        const loadingSpinner = loginButton.querySelector('.loading-spinner');
        
        buttonText.style.display = 'inline-flex';
        loadingSpinner.style.display = 'none';
        loginButton.disabled = false;
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        if (!toast) return;
        
        // Set message and style based on type
        toast.textContent = message;
        
        // Reset classes and add appropriate ones
        toast.className = 'toast';
        
        if (type === 'error') {
            toast.style.backgroundColor = '#ef4444'; // Red for errors
        } else if (type === 'success') {
            toast.style.backgroundColor = '#10b981'; // Green for success
        } else {
            toast.style.backgroundColor = '#1f2937'; // Default dark gray
        }
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
            
            // Hide after 5 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }, 100);
    }
    
    // Check for saved credentials if remember me was checked
    function checkSavedCredentials() {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedRemember = localStorage.getItem('rememberMe') === 'true';
        
        if (savedEmail && savedRemember) {
            emailInput.value = savedEmail;
            rememberMe.checked = true;
            passwordInput.focus();
        } else if (savedEmail) {
            // Clear saved email if remember me is not checked
            localStorage.removeItem('savedEmail');
        }
    }
    
    // Save credentials if remember me is checked
    function saveCredentials() {
        if (rememberMe.checked) {
            localStorage.setItem('savedEmail', emailInput.value.trim());
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('savedEmail');
            localStorage.setItem('rememberMe', 'false');
        }
    }
    
    // Event listener for remember me checkbox
    if (rememberMe) {
        rememberMe.addEventListener('change', saveCredentials);
    }
    
    // Check for saved credentials on page load
    checkSavedCredentials();
});
