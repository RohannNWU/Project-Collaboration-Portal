// supervisor.js

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
    // Initialize calendar
    var calendarEl = document.getElementById("calendar");
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            height: 400,
            events: [
                { title: "Project 1 Deadline", start: "2025-09-21" },
                { title: "Project 2 Deadline", start: "2025-10-06" },
                { title: "Project 3 Deadline", start: "2025-11-11" },
                { title: "Faculty Meeting", start: "2025-09-15T14:00:00" }
            ]
        });
        calendar.render();
    }

    // Set current year and date
    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("markingDate").textContent = new Date().toLocaleDateString();

    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize search functionality
    initializeSearch();
    
    // Hide panels initially
    document.getElementById('uploadPanel').style.display = 'none';
    document.getElementById('eventPanel').style.display = 'none';
    document.getElementById('markingPage').style.display = 'none';
});

// Initialize all event listeners
function initializeEventListeners() {
    // Quick action buttons
    document.getElementById('announcement-btn').addEventListener('click', showAnnouncementForm);
    document.getElementById('upload-btn').addEventListener('click', showUploadForm);
    document.getElementById('event-btn').addEventListener('click', showEventForm);
    document.getElementById('marking-btn').addEventListener('click', () => showMarkingPage());

    // Form submission buttons
    document.getElementById('send-announcement').addEventListener('click', sendAnnouncement);
    document.getElementById('upload-document').addEventListener('click', uploadDocument);
    document.getElementById('add-event').addEventListener('click', addEvent);

    // Marking functionality
    document.getElementById('close-marking').addEventListener('click', closeMarkingPage);
    document.getElementById('submit-marks').addEventListener('click', submitMarks);

    // Individual marking buttons
    document.querySelectorAll('.marking-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const student = this.getAttribute('data-student');
            const project = this.getAttribute('data-project');
            showMarkingPage(student, project);
        });
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Approve/Reject buttons
    initializeActionButtons();
}

// Initialize search functionality
function initializeSearch() {
    document.getElementById("searchInput").addEventListener("input", function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#student-work-table tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Initialize approve/reject buttons
function initializeActionButtons() {
    document.querySelectorAll('.approve-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', function() {
                approveWork(this);
            });
        }
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', function() {
                rejectWork(this);
            });
        }
    });
}

// Show/Hide Forms
function showAnnouncementForm() {
    document.getElementById('announcementForm').style.display = 'flex';
    document.getElementById('uploadPanel').style.display = 'none';
    document.getElementById('eventPanel').style.display = 'none';
}

function showUploadForm() {
    document.getElementById('announcementForm').style.display = 'none';
    document.getElementById('uploadPanel').style.display = 'block';
    document.getElementById('eventPanel').style.display = 'none';
}

function showEventForm() {
    document.getElementById('announcementForm').style.display = 'none';
    document.getElementById('uploadPanel').style.display = 'none';
    document.getElementById('eventPanel').style.display = 'block';
}

// Marking Functions
function showMarkingPage(student = '', project = '') {
    const markingPage = document.getElementById('markingPage');
    const title = document.getElementById('markingTitle');
    const studentLabel = document.getElementById('markingStudent');
    const projectLabel = document.getElementById('markingProject');
    
    if (student && project) {
        title.textContent = `Marking - ${student}`;
        studentLabel.textContent = `Student: ${student}`;
        projectLabel.textContent = `Project: ${project}`;
    } else {
        title.textContent = 'Marking Dashboard';
        studentLabel.textContent = 'Student: Select a submission';
        projectLabel.textContent = 'Project: -';
    }
    
    // Reset form
    document.getElementById('marks').value = '';
    document.getElementById('grade').value = '';
    document.getElementById('feedback').value = '';
    document.getElementById('status').value = 'pending';
    
    markingPage.style.display = 'flex';
}

function closeMarkingPage() {
    document.getElementById('markingPage').style.display = 'none';
}

function submitMarks() {
    const marks = document.getElementById('marks').value;
    const grade = document.getElementById('grade').value;
    const feedback = document.getElementById('feedback').value;
    const status = document.getElementById('status').value;

    if (!marks || !grade) {
        alert('Please enter marks and select a grade');
        return;
    }

    // Update the marking counter
    const currentCount = parseInt(document.getElementById('kpi-marking').textContent);
    document.getElementById('kpi-marking').textContent = Math.max(0, currentCount - 1);

    alert(`Marks submitted successfully!\nMarks: ${marks}\nGrade: ${grade}\nStatus: ${status}`);
    closeMarkingPage();
}

// Work Approval Functions
function approveWork(button) {
    const row = button.closest('tr');
    const statusCell = row.querySelector('td:nth-child(3)');
    statusCell.innerHTML = '<span class="status-approved">Approved</span>';
    button.disabled = true;
    row.querySelector('.reject-btn').disabled = false;
    
    // Update pending count
    updatePendingCount(-1);
}

function rejectWork(button) {
    const row = button.closest('tr');
    const statusCell = row.querySelector('td:nth-child(3)');
    statusCell.innerHTML = '<span class="status-rejected">Revisions Needed</span>';
    button.disabled = true;
    row.querySelector('.approve-btn').disabled = false;
}

function updatePendingCount(change) {
    const pendingElement = document.getElementById('kpi-pending');
    const currentCount = parseInt(pendingElement.textContent);
    const newCount = Math.max(0, currentCount + change);
    pendingElement.textContent = newCount;
}

// Other Functions
function sendAnnouncement() {
    const text = document.getElementById('announcementText').value;
    if (text) {
        const announcementsList = document.querySelector('#announcementsList .list');
        const newAnnouncement = document.createElement('li');
        newAnnouncement.innerHTML = `<i class="fas fa-bullhorn"></i> <strong>New:</strong> ${text}`;
        announcementsList.prepend(newAnnouncement);

        const currentCount = parseInt(document.getElementById('kpi-announcements').textContent);
        document.getElementById('kpi-announcements').textContent