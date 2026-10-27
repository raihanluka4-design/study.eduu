/**
 * Study Companion - Application Logic & Interactive Engine
 * Features:
 * - Role Switcher (Student / Teacher)
 * - IndexedDB / LocalStorage state for persistent lesson uploads & catch-up tracking
 * - Virtual Lab Simulations (Ohm's Law, Acid-Base Titration, Simple Pendulum) with HTML5 Canvas
 * - Workload stress calculation & task scheduler
 * - Search, Filter, and Handout viewer
 */

// Initial Seed Data - Engineering College Curriculum (EEE, CSE, ECE, Mechanical, Engg Math)
const DEFAULT_LESSONS = [
  {
    id: "les-eee-1",
    title: "Three-Phase Alternating Current (AC) Circuits & Star-Delta Conversion",
    subject: "Electrical & Electronics (EEE)",
    date: "2026-10-26",
    teacher: "Dr. K. S. Ramanathan (Professor, EEE)",
    desc: "Comprehensive college lecture on symmetrical 3-phase systems, line vs phase voltages (V_L = √3 V_ph), power measurement via two-wattmeter method, and reactive power compensation.",
    videoUrl: "https://www.youtube.com/embed/txmKr69jGBk",
    attachments: [
      { name: "3Phase_Circuits_Derivations_LectureNotes.pdf", size: "3.4 MB" },
      { name: "Star_Delta_Transformation_Cheatsheet.png", size: "1.2 MB" },
      { name: "NPTEL_EEE_Solved_Numericals_Unit2.pdf", size: "2.1 MB" }
    ],
    labId: "ohm",
    isMissed: true,
    completed: false
  },
  {
    id: "les-cse-1",
    title: "Dynamic Programming: 0/1 Knapsack & Bellman-Ford Algorithm",
    subject: "Computer Science & Eng (CSE)",
    date: "2026-10-25",
    teacher: "Prof. Priya Chandran (Head of CSE)",
    desc: "Optimal substructure analysis, bottom-up 2D tabulation vs memoization, space optimization to O(W), and detecting negative weight cycles with Bellman-Ford O(V·E).",
    videoUrl: "https://www.youtube.com/embed/oDqjPvD54Ss",
    attachments: [
      { name: "Dynamic_Programming_Knapsack_SourceCode.py", size: "24 KB" },
      { name: "Algorithm_Analysis_DP_Handout.pdf", size: "2.8 MB" }
    ],
    labId: "none",
    isMissed: true,
    completed: false
  },
  {
    id: "les-eee-2",
    title: "DC Motor Speed Control & Transformer Open/Short Circuit Tests",
    subject: "Electrical & Electronics (EEE)",
    date: "2026-10-24",
    teacher: "Dr. Robert Vance (Associate Dean, Electrical)",
    desc: "Equivalent circuit parameter determination via OC and SC tests. Armature voltage vs field flux control in DC shunt motors, back EMF calculation E_b = (P·Φ·Z·N)/(60·A).",
    videoUrl: "https://www.youtube.com/embed/9DkB82xLDNE",
    attachments: [
      { name: "Electrical_Machines_Lab_Manual_Exp3.pdf", size: "4.1 MB" },
      { name: "Transformer_Efficiency_Curves.xlsx", size: "180 KB" }
    ],
    labId: "ohm",
    isMissed: false,
    completed: true
  },
  {
    id: "les-ece-1",
    title: "Operational Amplifiers (Op-Amps): Inverting, Non-Inverting & Active Filters",
    subject: "Electronics & Comm (ECE)",
    date: "2026-10-23",
    teacher: "Prof. Rajesh Sundaram (ECE Faculty)",
    desc: "Virtual ground concept in IC 741, differential gain, CMRR analysis, Sallen-Key 2nd order Butterworth low-pass filter design with Bode magnitude plots.",
    videoUrl: "https://www.youtube.com/embed/2I-_SV8cwsw",
    attachments: [
      { name: "Analog_Circuits_OpAmp_Design_Guide.pdf", size: "2.6 MB" },
      { name: "Filter_Frequency_Response_Data.csv", size: "45 KB" }
    ],
    labId: "pendulum",
    isMissed: true,
    completed: false
  },
  {
    id: "les-mech-1",
    title: "Thermodynamics Second Law: Carnot Engine Efficiency & Entropy",
    subject: "Mechanical Engineering",
    date: "2026-10-22",
    teacher: "Dr. Elena Ramos (Mechanical & Aerospace Dept)",
    desc: "Clausius inequality, Kelvin-Planck statement, reversible vs irreversible processes, T-s diagram state transitions, and Rankine steam cycle efficiency optimizations.",
    videoUrl: "https://www.youtube.com/embed/00jbG_cfGuQ",
    attachments: [
      { name: "Thermodynamics_Steam_Tables_Summary.pdf", size: "1.9 MB" },
      { name: "Carnot_Cycle_Problem_Set.pdf", size: "850 KB" }
    ],
    labId: "titration",
    isMissed: false,
    completed: true
  },
  {
    id: "les-math-1",
    title: "Engineering Mathematics III: Laplace Transforms & Differential Equations",
    subject: "Engineering Mathematics",
    date: "2026-10-21",
    teacher: "Prof. Alan Turing (Applied Mathematics)",
    desc: "Laplace transforms of Dirac delta and heaviside unit step functions. Solving non-homogeneous 2nd order linear ordinary differential equations with initial value boundary conditions.",
    videoUrl: "https://www.youtube.com/embed/2I-_SV8cwsw",
    attachments: [
      { name: "Laplace_Transform_Pairs_Handbook.pdf", size: "1.5 MB" }
    ],
    labId: "none",
    isMissed: true,
    completed: false
  }
];

const DEFAULT_TASKS = [
  { id: "task-1", title: "Review 3-Phase AC Circuits lecture notes & solve star-delta numericals", subject: "Electrical & Electronics (EEE)", priority: "high", dueDate: "2026-10-28", completed: false },
  { id: "task-2", title: "Run Virtual Ohm's Law & Circuit practical and plot V-I curve", subject: "Electrical & Electronics (EEE)", priority: "high", dueDate: "2026-10-28", completed: false },
  { id: "task-3", title: "Implement 0/1 Knapsack bottom-up algorithm in Python/C++", subject: "Computer Science & Eng (CSE)", priority: "high", dueDate: "2026-10-29", completed: false },
  { id: "task-4", title: "Submit Op-Amp Inverting amplifier frequency response lab report", subject: "Electronics & Comm (ECE)", priority: "med", dueDate: "2026-10-30", completed: true },
  { id: "task-5", title: "Solve Laplace Transform problems for electrical transient analysis", subject: "Engineering Mathematics", priority: "med", dueDate: "2026-10-31", completed: false }
];

// App State
let state = {
  currentRole: 'student', // 'student' | 'teacher'
  userProfile: {
    name: 'Alex Johnson',
    role: 'B.Tech CSE - 3rd Year',
    department: 'CSE',
    avatar: 'A'
  },
  currentView: 'dashboard',
  lessons: [],
  tasks: [],
  activeFilter: 'all',
  searchQuery: '',
  theme: 'dark',
  currentModalLesson: null,
  activeLab: 'ohm',
  labParams: {
    // Ohm's law (Circuit lab for EEE / Physics)
    ohmVoltage: 6,
    ohmResistance: 12,
    ohmObservations: [],
    // Titration
    titrantVolumeAdded: 0,
    acidConcentration: 0.1,
    flaskAcidVol: 25,
    stopcockOpen: false,
    titrationObservations: [],
    // Pendulum
    pendulumLength: 1.0, // meters
    pendulumAngle: 30, // degrees
    pendulumObservations: []
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  initLabCanvas();
  renderAllViews();
});

function loadData() {
  const storedLessons = localStorage.getItem('mp_lessons_eng');
  state.lessons = storedLessons ? JSON.parse(storedLessons) : DEFAULT_LESSONS;

  const storedTasks = localStorage.getItem('mp_tasks_eng');
  state.tasks = storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS;

  const storedProfile = localStorage.getItem('mp_profile_eng');
  if (storedProfile) {
    try {
      state.userProfile = JSON.parse(storedProfile);
    } catch (e) {}
  }

  const storedRole = localStorage.getItem('mp_role_eng') || 'student';
  state.currentRole = storedRole;

  const savedTheme = localStorage.getItem('mp_theme') || 'dark';
  setTheme(savedTheme);

  // Set default upload date to today
  const uploadDateInput = document.getElementById('uploadDate');
  if (uploadDateInput) {
    const today = new Date().toISOString().split('T')[0];
    uploadDateInput.value = today;
  }

  applyUserProfile();
}

function saveData() {
  localStorage.setItem('mp_lessons_eng', JSON.stringify(state.lessons));
  localStorage.setItem('mp_tasks_eng', JSON.stringify(state.tasks));
  localStorage.setItem('mp_profile_eng', JSON.stringify(state.userProfile));
  localStorage.setItem('mp_role_eng', state.currentRole);
}

function applyUserProfile() {
  const studentBtn = document.getElementById('roleStudentBtn');
  const teacherBtn = document.getElementById('roleTeacherBtn');
  const teacherOnlyElems = document.querySelectorAll('.teacher-only');
  const studentOnlyElems = document.querySelectorAll('.student-only');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleDisplay = document.getElementById('userRoleDisplay');
  const userAvatar = document.getElementById('userAvatar');
  const heroGreeting = document.getElementById('heroGreeting');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const authButtonText = document.getElementById('authButtonText');
  const teacherBannerStatus = document.getElementById('teacherBannerStatus');

  if (state.currentRole === 'teacher') {
    if (studentBtn) studentBtn.classList.remove('active');
    if (teacherBtn) teacherBtn.classList.add('active');
    teacherOnlyElems.forEach(el => el.style.display = 'inline-flex');
    studentOnlyElems.forEach(el => el.style.display = 'none');
    
    if (userNameDisplay) userNameDisplay.innerText = state.userProfile.name || "Dr. Robert Vance";
    if (userRoleDisplay) userRoleDisplay.innerText = state.userProfile.role || "Professor & Head - EEE/CSE";
    if (userAvatar) {
      userAvatar.innerText = (state.userProfile.name ? state.userProfile.name[0] : "R").toUpperCase();
      userAvatar.style.background = "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)";
    }
    if (heroGreeting) heroGreeting.innerText = `Welcome back, ${state.userProfile.name || 'Professor'}!`;
    if (heroSubtitle) {
      heroSubtitle.innerHTML = `Engineering Faculty Portal active. Upload class lectures, YouTube links, and PDF handouts for absent students.`;
    }
    if (authButtonText) authButtonText.innerText = "Faculty Logged In";
    if (teacherBannerStatus) teacherBannerStatus.innerText = "Faculty Mode Active";
  } else {
    if (teacherBtn) teacherBtn.classList.remove('active');
    if (studentBtn) studentBtn.classList.add('active');
    teacherOnlyElems.forEach(el => el.style.display = 'none');
    studentOnlyElems.forEach(el => el.style.display = 'inline-flex');

    if (userNameDisplay) userNameDisplay.innerText = state.userProfile.name || "Alex Johnson";
    if (userRoleDisplay) userRoleDisplay.innerText = state.userProfile.role || "B.Tech CSE - 3rd Year";
    if (userAvatar) {
      userAvatar.innerText = (state.userProfile.name ? state.userProfile.name[0] : "A").toUpperCase();
      userAvatar.style.background = "var(--accent-gradient-purple)";
    }
    if (heroGreeting) heroGreeting.innerText = `Welcome back, ${state.userProfile.name || 'Alex'}!`;
    if (heroSubtitle) {
      heroSubtitle.innerHTML = `Engineering Academic Portal. Catch up on missed college classes in <strong>EEE (Circuit Theory), CSE (Data Structures), and ECE</strong>. Watch YouTube lectures and simulate labs below.`;
    }
    if (authButtonText) authButtonText.innerText = "Student Logged In";
    if (teacherBannerStatus) teacherBannerStatus.innerText = "Quick Faculty Upload Available";
  }
}

// Role Management
function switchRole(role) {
  state.currentRole = role;
  
  if (role === 'teacher') {
    state.userProfile = {
      name: "Dr. Robert Vance",
      role: "Professor & Head - EEE Dept",
      department: "EEE",
      avatar: "R"
    };
    showToast("Switched to Faculty Mode: You can publish lecture notes and manage classes.", "success");
  } else {
    state.userProfile = {
      name: "Alex Johnson",
      role: "B.Tech CSE - 3rd Year",
      department: "CSE",
      avatar: "A"
    };
    showToast("Switched to Student Mode: Catch up on missed engineering classes.", "info");
  }

  saveData();
  applyUserProfile();
  updateDashboardStats();
  renderTeacherUploads();
}

// Precise Login Modal Handling
function openLoginModal() {
  const roleSelect = document.getElementById('loginRole');
  if (roleSelect) {
    roleSelect.value = state.currentRole;
    handleLoginRoleChange(state.currentRole);
  }
  const nameInput = document.getElementById('loginName');
  if (nameInput) nameInput.value = state.userProfile.name || '';
  
  openModal('loginModal');
}

function handleLoginRoleChange(role) {
  const idLabel = document.getElementById('loginIdLabel');
  const deptLabel = document.getElementById('loginDeptLabel');
  const idInput = document.getElementById('loginId');

  if (role === 'teacher') {
    if (idLabel) idLabel.innerText = "Faculty Staff ID / Email";
    if (deptLabel) deptLabel.innerText = "Faculty Department";
    if (idInput) idInput.placeholder = "e.g. prof.vance@engineering.edu";
  } else {
    if (idLabel) idLabel.innerText = "Roll Number / Student ID";
    if (deptLabel) deptLabel.innerText = "Student Major / Department";
    if (idInput) idInput.placeholder = "e.g. 23CS4029 or 23EE1045";
  }
}

function handlePreciseLogin(event) {
  event.preventDefault();
  const role = document.getElementById('loginRole').value;
  const name = document.getElementById('loginName').value.trim() || (role === 'teacher' ? 'Professor' : 'Student');
  const dept = document.getElementById('loginDepartment').value;
  const id = document.getElementById('loginId').value.trim();

  state.currentRole = role;
  state.userProfile = {
    name,
    role: role === 'teacher' ? `Professor - Dept of ${dept}` : `B.Tech ${dept} (${id || 'Roll: 23' + dept + '101'})`,
    department: dept,
    avatar: name.charAt(0).toUpperCase()
  };

  saveData();
  applyUserProfile();
  closeModal('loginModal');
  showToast(`Signed in successfully as ${name} (${role === 'teacher' ? 'Faculty' : 'Student'})!`, "success");
}

function quickLogin(role) {
  switchRole(role);
  closeModal('loginModal');
}

function handleTopUploadClick() {
  openUploadModal();
}

// Navigation
function navigateTo(viewId) {
  state.currentView = viewId;
  
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(`view-${viewId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  document.querySelectorAll('.nav-item-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    }
  });

  if (viewId === 'virtuallab') {
    setTimeout(drawLabSimulation, 50);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Theme Toggle
function toggleTheme() {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function setTheme(theme) {
  state.theme = theme;
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('themeToggleBtn').innerText = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeToggleBtn').innerText = '🌓';
  }
  localStorage.setItem('mp_theme', theme);
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✅' : (type === 'alert' ? '⚠️' : '🔔');
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal Handlers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openUploadModal() {
  openModal('uploadModal');
}

function openAddTaskModal() {
  openModal('taskModal');
}

function openAbsenceReportModal() {
  showToast("Attendance synchronization: 2 absent sessions automatically detected from attendance register.", "info");
  navigateTo('lessons');
}

function showNotifications() {
  showToast("Reminder: Faraday's Law practical assignment is due tomorrow at 5:00 PM!");
}

// Global Search
function handleGlobalSearch(query) {
  state.searchQuery = query.toLowerCase().trim();
  renderLessons();
  if (state.currentView !== 'lessons') {
    navigateTo('lessons');
  }
}

// Filter Lessons
function filterLessons(subject, chipElem) {
  state.activeFilter = subject;
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
  if (chipElem) chipElem.classList.add('active');
  renderLessons();
}

// Render Functions
function renderAllViews() {
  updateDashboardStats();
  renderDashboardRecent();
  renderLessons();
  renderWorkloadTasks();
  renderTeacherUploads();
  setupSimulationControls();
}

function updateDashboardStats() {
  const missedCount = state.lessons.filter(l => l.isMissed && !l.completed).length;
  const totalMissed = state.lessons.filter(l => l.isMissed).length;
  const completedMissed = state.lessons.filter(l => l.isMissed && l.completed).length;
  
  const percentage = totalMissed === 0 ? 100 : Math.round((completedMissed / totalMissed) * 100);

  const missedCountElem = document.getElementById('statMissedCount');
  if (missedCountElem) missedCountElem.innerText = missedCount;

  const progressElem = document.getElementById('statCatchupProgress');
  if (progressElem) progressElem.innerText = `${percentage}%`;

  const badgeElem = document.getElementById('missedClassesBadge');
  if (badgeElem) badgeElem.innerText = `${missedCount} Pending`;

  // Workload stress calculation
  const pendingTasks = state.tasks.filter(t => !t.completed).length;
  const stressMeter = document.getElementById('stressMeterGauge');
  const stressText = document.getElementById('stressStatusText');
  const statStress = document.getElementById('statStressLevel');

  let stressPercent = Math.min(100, Math.max(20, (missedCount * 18) + (pendingTasks * 10)));
  let color = 'var(--success)';
  let label = 'Low Stress';

  if (stressPercent > 40 && stressPercent <= 70) {
    color = 'var(--warning)';
    label = 'Moderate Load';
  } else if (stressPercent > 70) {
    color = 'var(--danger)';
    label = 'High Load';
  }

  if (stressMeter) {
    stressMeter.style.background = `conic-gradient(${color} ${stressPercent}%, rgba(255, 255, 255, 0.08) 0)`;
    stressMeter.setAttribute('style', `background: conic-gradient(${color} ${stressPercent}%, rgba(255, 255, 255, 0.08) 0);`);
    // update ::after text
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `.meter-gauge::after { content: '${stressPercent}%'; }`;
    document.head.appendChild(styleSheet);
  }

  if (stressText) stressText.innerText = label;
  if (statStress) statStress.innerText = label;
}

function renderDashboardRecent() {
  const container = document.getElementById('dashboardRecentGrid');
  if (!container) return;
  const pendingLessons = state.lessons.filter(l => l.isMissed && !l.completed).slice(0, 3);
  
  if (pendingLessons.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 2rem; text-align: center; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <p style="font-size: 1.1rem; font-weight: 600; color: var(--success);">🎉 All caught up! No pending missed classes.</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.4rem;">Browse all subjects or practice simulations in the Virtual Lab.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingLessons.map(lesson => createLessonCardHTML(lesson)).join('');
}

function renderLessons() {
  const container = document.getElementById('lessonsGrid');
  if (!container) return;

  let filtered = state.lessons.filter(lesson => {
    // Subject filter
    if (state.activeFilter === 'missed-only') {
      if (!lesson.isMissed || lesson.completed) return false;
    } else if (state.activeFilter !== 'all') {
      if (lesson.subject !== state.activeFilter) return false;
    }

    // Search query filter
    if (state.searchQuery) {
      const matchTitle = lesson.title.toLowerCase().includes(state.searchQuery);
      const matchDesc = lesson.desc.toLowerCase().includes(state.searchQuery);
      const matchTeacher = lesson.teacher.toLowerCase().includes(state.searchQuery);
      const matchSubject = lesson.subject.toLowerCase().includes(state.searchQuery);
      return matchTitle || matchDesc || matchTeacher || matchSubject;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 3rem; text-align: center; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <p style="font-size: 1.2rem; font-weight: 600;">🔍 No lessons found</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.4rem;">Try adjusting your search terms or filter tags.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(lesson => createLessonCardHTML(lesson)).join('');
}

function getSubjectPillClass(subject) {
  if (subject.includes('EEE') || subject.includes('Electrical')) return 'pill-eee';
  if (subject.includes('CSE') || subject.includes('Computer')) return 'pill-cse';
  if (subject.includes('ECE') || subject.includes('Electronics')) return 'pill-ece';
  if (subject.includes('Mech')) return 'pill-mech';
  if (subject.includes('Math')) return 'pill-math';
  if (subject.includes('Civil')) return 'pill-civil';
  return 'pill-cse';
}

function createLessonCardHTML(lesson) {
  const pillClass = getSubjectPillClass(lesson.subject);
  const statusBadge = lesson.completed 
    ? `<span style="font-size: 0.75rem; color: var(--success); font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">✅ Caught Up</span>`
    : `<span style="font-size: 0.75rem; color: var(--warning); font-weight: 600; display: inline-flex; align-items: center; gap: 0.25rem;">⏳ Action Needed</span>`;

  const labTag = lesson.labId !== 'none' 
    ? `<span class="attachment-badge" style="color: #67e8f9; border-color: rgba(6, 182, 212, 0.3);">🔬 Virtual Lab</span>` 
    : '';

  return `
    <article class="lesson-card" id="card-${lesson.id}">
      <div class="lesson-thumb">
        <span class="lesson-subject-pill ${pillClass}">${lesson.subject}</span>
        <div class="video-badge">
          <span>📹 Video Class</span>
        </div>
        <div class="play-preview-btn" onclick="openLessonViewer('${lesson.id}')" title="Watch Class & Notes">
          ▶
        </div>
      </div>

      <div class="lesson-body">
        <div class="lesson-meta">
          <span>📅 ${formatDate(lesson.date)}</span>
          <span>•</span>
          <span>👨‍🏫 ${lesson.teacher}</span>
        </div>

        <h3 class="lesson-title">${escapeHTML(lesson.title)}</h3>
        <p class="lesson-desc">${escapeHTML(lesson.desc)}</p>

        <div class="lesson-attachments">
          <span class="attachment-badge">📎 ${lesson.attachments ? lesson.attachments.length : 0} Handouts</span>
          ${labTag}
        </div>

        <div class="lesson-actions">
          <label class="catchup-check">
            <input type="checkbox" ${lesson.completed ? 'checked' : ''} onchange="toggleLessonCompletion('${lesson.id}', this.checked)">
            <span>Caught up</span>
          </label>
          <button class="btn-secondary" style="padding: 0.4rem 0.85rem; font-size: 0.78rem;" onclick="openLessonViewer('${lesson.id}')">
            View Lesson & Notes →
          </button>
        </div>
      </div>
    </article>
  `;
}

function toggleLessonCompletion(id, isCompleted) {
  const lesson = state.lessons.find(l => l.id === id);
  if (lesson) {
    lesson.completed = isCompleted;
    saveData();
    updateDashboardStats();
    renderDashboardRecent();
    showToast(isCompleted ? "Marked as caught up! Great work!" : "Marked as pending catch-up.");
  }
}

// Lesson Viewer Modal
function openLessonViewer(id) {
  const lesson = state.lessons.find(l => l.id === id);
  if (!lesson) return;

  state.currentModalLesson = lesson;

  document.getElementById('viewerModalTitle').innerText = lesson.title;
  document.getElementById('viewerModalDate').innerText = `Taught by ${lesson.teacher} on ${formatDate(lesson.date)}`;
  document.getElementById('viewerModalDesc').innerText = lesson.desc;
  
  const subjectPill = document.getElementById('viewerSubjectPill');
  subjectPill.className = `lesson-subject-pill ${getSubjectPillClass(lesson.subject)}`;
  subjectPill.innerText = lesson.subject;

  // Video loader
  const videoContainer = document.getElementById('videoContainer');
  const normalizedVideoUrl = formatYouTubeEmbedUrl(lesson.videoUrl);
  if (normalizedVideoUrl && (normalizedVideoUrl.includes('youtube') || normalizedVideoUrl.includes('youtu.be'))) {
    videoContainer.innerHTML = `<iframe src="${normalizedVideoUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
  } else if (normalizedVideoUrl) {
    videoContainer.innerHTML = `<video controls src="${normalizedVideoUrl}"></video>`;
  } else {
    videoContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted);">
        <p style="font-size: 2rem;">📹</p>
        <p style="font-weight: 600;">Recorded Lecture Streaming Link</p>
        <p style="font-size: 0.78rem;">Faculty member provided direct whiteboard transcript and formulas below.</p>
      </div>
    `;
  }

  // Attachments
  const attachmentsList = document.getElementById('viewerAttachmentsList');
  if (lesson.attachments && lesson.attachments.length > 0) {
    attachmentsList.innerHTML = lesson.attachments.map(att => `
      <div class="attachment-badge" style="cursor: pointer; padding: 0.5rem 0.8rem; font-size: 0.82rem;" onclick="downloadSampleAttachment('${escapeHTML(att.name)}')">
        <span>📄</span>
        <span>${escapeHTML(att.name)}</span>
        <span style="color: var(--text-dim); font-size: 0.72rem;">(${att.size})</span>
        <span style="margin-left: 0.3rem; color: #818cf8;">⬇</span>
      </div>
    `).join('');
  } else {
    attachmentsList.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-dim);">No extra handouts attached.</span>`;
  }

  // Catchup checkbox
  const check = document.getElementById('viewerCatchupCheck');
  if (check) check.checked = lesson.completed;

  openModal('viewerModal');
}

function formatYouTubeEmbedUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  // Handle youtube.com/watch?v=XXXX
  if (clean.includes('watch?v=')) {
    const videoId = clean.split('watch?v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // Handle youtu.be/XXXX
  if (clean.includes('youtu.be/')) {
    const videoId = clean.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return clean;
}

function toggleCatchupFromModal() {
  if (state.currentModalLesson) {
    const check = document.getElementById('viewerCatchupCheck');
    toggleLessonCompletion(state.currentModalLesson.id, check.checked);
    renderLessons();
  }
}

function downloadSampleAttachment(fileName) {
  showToast(`Downloaded: "${fileName}" to your local drive!`, "success");
}

// Teacher Upload Handling
let uploadedFileStore = [];

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  uploadedFileStore = files;
  const listElem = document.getElementById('selectedFilesList');
  if (files.length > 0) {
    listElem.innerText = `Selected ${files.length} file(s): ` + files.map(f => f.name).join(', ');
  } else {
    listElem.innerText = '';
  }
}

function handleTeacherUpload(event) {
  event.preventDefault();

  const title = document.getElementById('uploadTitle').value.trim();
  const subject = document.getElementById('uploadSubject').value;
  const date = document.getElementById('uploadDate').value;
  const desc = document.getElementById('uploadDesc').value.trim();
  const videoUrl = document.getElementById('uploadVideoUrl').value.trim();
  const labLink = document.getElementById('uploadLabLink').value;

  const attachments = uploadedFileStore.length > 0 
    ? uploadedFileStore.map(f => ({ name: f.name, size: formatBytes(f.size) }))
    : [{ name: `${title.replace(/\s+/g, '_')}_LectureNotes.pdf`, size: '1.5 MB' }];

  const teacherName = state.currentRole === 'teacher' 
    ? (state.userProfile.name || "Dr. Robert Vance (Faculty)")
    : (state.userProfile.name ? `${state.userProfile.name} (Contributor)` : "Faculty Member");

  const newLesson = {
    id: "les-" + Date.now(),
    title,
    subject,
    date,
    teacher: teacherName,
    desc,
    videoUrl: formatYouTubeEmbedUrl(videoUrl) || "https://www.youtube.com/embed/txmKr69jGBk",
    attachments,
    labId: labLink,
    isMissed: true,
    completed: false
  };

  state.lessons.unshift(newLesson);
  saveData();
  
  // Reset Form
  document.getElementById('teacherUploadForm').reset();
  uploadedFileStore = [];
  document.getElementById('selectedFilesList').innerText = '';
  closeModal('uploadModal');

  renderAllViews();
  showToast("Lecture & notes published successfully! Students can now review and catch up.", "success");
}

function renderTeacherUploads() {
  const container = document.getElementById('teacherUploadsGrid');
  if (!container) return;

  container.innerHTML = state.lessons.map(lesson => `
    <div class="lesson-card" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <span class="lesson-subject-pill ${getSubjectPillClass(lesson.subject)}">${lesson.subject}</span>
        <span style="font-size: 0.75rem; color: var(--text-dim);">${formatDate(lesson.date)}</span>
      </div>
      <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.4rem;">${escapeHTML(lesson.title)}</h3>
      <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">${escapeHTML(lesson.desc.substring(0, 110))}...</p>
      
      <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 1rem;">
        📎 ${lesson.attachments ? lesson.attachments.length : 0} attachments | Lab: ${lesson.labId}
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-glass); padding-top: 0.75rem;">
        <button class="btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;" onclick="openLessonViewer('${lesson.id}')">Preview</button>
        <button class="btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; color: var(--danger); border-color: rgba(239, 68, 68, 0.3);" onclick="deleteLesson('${lesson.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

function deleteLesson(id) {
  if (confirm("Are you sure you want to remove this published lesson?")) {
    state.lessons = state.lessons.filter(l => l.id !== id);
    saveData();
    renderAllViews();
    showToast("Lesson removed.");
  }
}

// Workload Optimizer Tasks
function renderWorkloadTasks() {
  const listContainer = document.getElementById('workloadTaskList');
  if (!listContainer) return;

  listContainer.innerHTML = state.tasks.map(task => {
    const priorityClass = task.priority === 'high' ? 'priority-high' : (task.priority === 'med' ? 'priority-med' : 'priority-low');
    return `
      <li class="task-queue-item">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span class="priority-indicator ${priorityClass}"></span>
          <div style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
            <div style="font-size: 0.88rem; font-weight: 600;">${escapeHTML(task.title)}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Due: ${formatDate(task.dueDate)} • ${task.subject}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)" style="accent-color: var(--accent-primary); width: 17px; height: 17px; cursor: pointer;">
          <button style="background: none; border: none; color: var(--text-dim); cursor: pointer;" onclick="deleteTask('${task.id}')" title="Delete">✕</button>
        </div>
      </li>
    `;
  }).join('');
}

function handleAddTask(event) {
  event.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const subject = document.getElementById('taskSubject').value;
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;

  const newTask = {
    id: "task-" + Date.now(),
    title,
    subject,
    priority,
    dueDate,
    completed: false
  };

  state.tasks.push(newTask);
  saveData();
  document.getElementById('addTaskForm').reset();
  closeModal('taskModal');
  renderWorkloadTasks();
  updateDashboardStats();
  showToast("Task added to catch-up schedule!", "success");
}

function toggleTask(id, completed) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = completed;
    saveData();
    renderWorkloadTasks();
    updateDashboardStats();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveData();
  renderWorkloadTasks();
  updateDashboardStats();
}

/* ==========================================================================
   VIRTUAL LAB SIMULATION ENGINE (CANVAS BASED)
   1. Ohm's Law (V = IR)
   2. Acid-Base Neutralization Titration
   3. Simple Pendulum Experiment
   ========================================================================== */

let canvas, ctx;
let animationFrameId = null;

function initLabCanvas() {
  canvas = document.getElementById('labCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  // Set real pixel canvas dimensions
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawLabSimulation();
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function switchSimulation(simKey) {
  state.activeLab = simKey;
  const titleElem = document.getElementById('labSimTitle');
  
  if (simKey === 'ohm') {
    titleElem.innerText = "⚡ Ohm's Law Verification Experiment (V = I · R)";
  } else if (simKey === 'titration') {
    titleElem.innerText = "⚗️ Acid-Base Neutralization Titration (HCl + NaOH)";
  } else if (simKey === 'pendulum') {
    titleElem.innerText = "⏱️ Simple Pendulum Acceleration due to Gravity (g) Test";
  }

  setupSimulationControls();
  updateObservationTableHeader();
  drawLabSimulation();
}

function setupSimulationControls() {
  const container = document.getElementById('dynamicLabControls');
  if (!container) return;

  if (state.activeLab === 'ohm') {
    container.innerHTML = `
      <div class="slider-group">
        <div class="slider-label">
          <span>Battery Voltage (V)</span>
          <span id="voltValDisplay">${state.labParams.ohmVoltage} V</span>
        </div>
        <input type="range" class="custom-range" min="1" max="24" step="0.5" value="${state.labParams.ohmVoltage}" oninput="updateOhmVoltage(this.value)">
      </div>
      <div class="slider-group">
        <div class="slider-label">
          <span>Rheostat Resistance (R)</span>
          <span id="resValDisplay">${state.labParams.ohmResistance} Ω</span>
        </div>
        <input type="range" class="custom-range" min="2" max="50" step="1" value="${state.labParams.ohmResistance}" oninput="updateOhmResistance(this.value)">
      </div>
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; margin-top: 0.5rem; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span style="color: var(--text-dim);">Ammeter Reading (I):</span>
          <strong id="ohmCurrentDisplay" style="color: #22d3ee;">${(state.labParams.ohmVoltage / state.labParams.ohmResistance).toFixed(3)} A</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-dim);">Voltmeter Reading (V):</span>
          <strong id="ohmVoltDisplay" style="color: #818cf8;">${state.labParams.ohmVoltage.toFixed(1)} V</strong>
        </div>
      </div>
    `;
  } else if (state.activeLab === 'titration') {
    container.innerHTML = `
      <div class="slider-group">
        <div class="slider-label">
          <span>Add 0.1M NaOH Titrant (mL)</span>
          <span id="titrantValDisplay">${state.labParams.titrantVolumeAdded.toFixed(1)} mL</span>
        </div>
        <input type="range" class="custom-range" min="0" max="50" step="0.5" value="${state.labParams.titrantVolumeAdded}" oninput="updateTitrantVolume(this.value)">
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn-secondary" style="flex: 1; font-size: 0.78rem;" onclick="addDropTitrant(0.5)">💧 Add 0.5 mL</button>
        <button class="btn-secondary" style="flex: 1; font-size: 0.78rem;" onclick="addDropTitrant(1.0)">💧 Add 1.0 mL</button>
      </div>
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; margin-top: 0.75rem; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span style="color: var(--text-dim);">Calculated Solution pH:</span>
          <strong id="titrationPhDisplay" style="color: #f472b6;">${calculateTitrationPH(state.labParams.titrantVolumeAdded).toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-dim);">Indicator Color:</span>
          <strong id="titrationColorDisplay" style="color: #f472b6;">Colorless (Acidic)</strong>
        </div>
      </div>
    `;
  } else if (state.activeLab === 'pendulum') {
    container.innerHTML = `
      <div class="slider-group">
        <div class="slider-label">
          <span>String Length L (m)</span>
          <span id="pendulumLengthDisplay">${state.labParams.pendulumLength} m</span>
        </div>
        <input type="range" class="custom-range" min="0.5" max="2.5" step="0.1" value="${state.labParams.pendulumLength}" oninput="updatePendulumLength(this.value)">
      </div>
      <div class="slider-group">
        <div class="slider-label">
          <span>Initial Release Angle (θ)</span>
          <span id="pendulumAngleDisplay">${state.labParams.pendulumAngle}°</span>
        </div>
        <input type="range" class="custom-range" min="5" max="60" step="5" value="${state.labParams.pendulumAngle}" oninput="updatePendulumAngle(this.value)">
      </div>
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; margin-top: 0.5rem; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <span style="color: var(--text-dim);">Theoretical Period T:</span>
          <strong id="pendulumPeriodDisplay" style="color: #fbbf24;">${(2 * Math.PI * Math.sqrt(state.labParams.pendulumLength / 9.8)).toFixed(3)} s</strong>
        </div>
      </div>
    `;
  }
}

function updateOhmVoltage(val) {
  state.labParams.ohmVoltage = parseFloat(val);
  document.getElementById('voltValDisplay').innerText = `${state.labParams.ohmVoltage} V`;
  const current = state.labParams.ohmVoltage / state.labParams.ohmResistance;
  document.getElementById('ohmCurrentDisplay').innerText = `${current.toFixed(3)} A`;
  document.getElementById('ohmVoltDisplay').innerText = `${state.labParams.ohmVoltage.toFixed(1)} V`;
  drawLabSimulation();
}

function updateOhmResistance(val) {
  state.labParams.ohmResistance = parseFloat(val);
  document.getElementById('resValDisplay').innerText = `${state.labParams.ohmResistance} Ω`;
  const current = state.labParams.ohmVoltage / state.labParams.ohmResistance;
  document.getElementById('ohmCurrentDisplay').innerText = `${current.toFixed(3)} A`;
  drawLabSimulation();
}

function updateTitrantVolume(val) {
  state.labParams.titrantVolumeAdded = parseFloat(val);
  const display = document.getElementById('titrantValDisplay');
  if (display) display.innerText = `${state.labParams.titrantVolumeAdded.toFixed(1)} mL`;
  updateTitrationReadings();
  drawLabSimulation();
}

function addDropTitrant(amount) {
  state.labParams.titrantVolumeAdded = Math.min(50, state.labParams.titrantVolumeAdded + amount);
  const slider = document.querySelector('.custom-range');
  if (slider) slider.value = state.labParams.titrantVolumeAdded;
  const display = document.getElementById('titrantValDisplay');
  if (display) display.innerText = `${state.labParams.titrantVolumeAdded.toFixed(1)} mL`;
  updateTitrationReadings();
  drawLabSimulation();
}

function calculateTitrationPH(volAdded) {
  // 25mL of 0.1M HCl neutralized by 0.1M NaOH (equivalence at exactly 25.0 mL)
  const initialMolesAcid = 0.025 * 0.1; // 0.0025 moles
  const molesBaseAdded = (volAdded / 1000) * 0.1;
  const totalVolume = 0.025 + (volAdded / 1000);

  if (volAdded < 25.0) {
    const unneutralizedAcid = initialMolesAcid - molesBaseAdded;
    const hConc = unneutralizedAcid / totalVolume;
    return -Math.log10(hConc);
  } else if (Math.abs(volAdded - 25.0) < 0.05) {
    return 7.00; // Neutral Equivalence Point
  } else {
    const excessBase = molesBaseAdded - initialMolesAcid;
    const ohConc = excessBase / totalVolume;
    const pOH = -Math.log10(ohConc);
    return 14 - pOH;
  }
}

function updateTitrationReadings() {
  const ph = calculateTitrationPH(state.labParams.titrantVolumeAdded);
  const phDisplay = document.getElementById('titrationPhDisplay');
  const colorDisplay = document.getElementById('titrationColorDisplay');

  if (phDisplay) phDisplay.innerText = ph.toFixed(2);
  
  if (colorDisplay) {
    if (ph < 8.2) {
      colorDisplay.innerText = "Colorless (Acidic)";
      colorDisplay.style.color = "#9ca3af";
    } else if (ph >= 8.2 && ph <= 9.0) {
      colorDisplay.innerText = "Faint Pink (Endpoint!)";
      colorDisplay.style.color = "#f472b6";
    } else {
      colorDisplay.innerText = "Deep Magenta (Excess Base)";
      colorDisplay.style.color = "#ec4899";
    }
  }
}

function updatePendulumLength(val) {
  state.labParams.pendulumLength = parseFloat(val);
  document.getElementById('pendulumLengthDisplay').innerText = `${state.labParams.pendulumLength} m`;
  const period = 2 * Math.PI * Math.sqrt(state.labParams.pendulumLength / 9.8);
  document.getElementById('pendulumPeriodDisplay').innerText = `${period.toFixed(3)} s`;
  drawLabSimulation();
}

function updatePendulumAngle(val) {
  state.labParams.pendulumAngle = parseFloat(val);
  document.getElementById('pendulumAngleDisplay').innerText = `${state.labParams.pendulumAngle}°`;
  drawLabSimulation();
}

function resetCurrentSimulation() {
  if (state.activeLab === 'ohm') {
    state.labParams.ohmVoltage = 6;
    state.labParams.ohmResistance = 12;
    state.labParams.ohmObservations = [];
  } else if (state.activeLab === 'titration') {
    state.labParams.titrantVolumeAdded = 0;
    state.labParams.titrationObservations = [];
  } else if (state.activeLab === 'pendulum') {
    state.labParams.pendulumLength = 1.0;
    state.labParams.pendulumAngle = 30;
    state.labParams.pendulumObservations = [];
  }
  setupSimulationControls();
  renderObservationTable();
  drawLabSimulation();
  showToast("Simulation environment reset.");
}

function updateObservationTableHeader() {
  const thead = document.getElementById('observationTableHead');
  if (!thead) return;

  if (state.activeLab === 'ohm') {
    thead.innerHTML = `
      <th>Trial</th>
      <th>Voltage (V)</th>
      <th>Current (A)</th>
      <th>R = V/I (Ω)</th>
    `;
  } else if (state.activeLab === 'titration') {
    thead.innerHTML = `
      <th>Trial</th>
      <th>NaOH Vol (mL)</th>
      <th>Solution pH</th>
      <th>Color State</th>
    `;
  } else if (state.activeLab === 'pendulum') {
    thead.innerHTML = `
      <th>Trial</th>
      <th>Length L (m)</th>
      <th>Time Period T (s)</th>
      <th>g = 4π²L/T² (m/s²)</th>
    `;
  }
  renderObservationTable();
}

function recordObservation() {
  if (state.activeLab === 'ohm') {
    const v = state.labParams.ohmVoltage;
    const i = v / state.labParams.ohmResistance;
    const r = v / i;
    state.labParams.ohmObservations.push({
      trial: state.labParams.ohmObservations.length + 1,
      val1: v.toFixed(2),
      val2: i.toFixed(3),
      val3: r.toFixed(2)
    });
  } else if (state.activeLab === 'titration') {
    const vol = state.labParams.titrantVolumeAdded;
    const ph = calculateTitrationPH(vol);
    const color = ph >= 8.2 ? (ph > 9.0 ? "Magenta" : "Pale Pink") : "Clear";
    state.labParams.titrationObservations.push({
      trial: state.labParams.titrationObservations.length + 1,
      val1: vol.toFixed(1),
      val2: ph.toFixed(2),
      val3: color
    });
  } else if (state.activeLab === 'pendulum') {
    const l = state.labParams.pendulumLength;
    const t = 2 * Math.PI * Math.sqrt(l / 9.8);
    const g = (4 * Math.PI * Math.PI * l) / (t * t);
    state.labParams.pendulumObservations.push({
      trial: state.labParams.pendulumObservations.length + 1,
      val1: l.toFixed(2),
      val2: t.toFixed(3),
      val3: g.toFixed(2)
    });
  }

  renderObservationTable();
  showToast("Reading recorded to observation table!", "success");
}

function renderObservationTable() {
  const tbody = document.getElementById('observationTableBody');
  if (!tbody) return;

  let obs = [];
  if (state.activeLab === 'ohm') obs = state.labParams.ohmObservations;
  else if (state.activeLab === 'titration') obs = state.labParams.titrationObservations;
  else if (state.activeLab === 'pendulum') obs = state.labParams.pendulumObservations;

  if (obs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="color: var(--text-dim); padding: 1rem;">No readings recorded yet. Use sliders and click "Record Reading".</td></tr>`;
    return;
  }

  tbody.innerHTML = obs.map(o => `
    <tr>
      <td>#${o.trial}</td>
      <td>${o.val1}</td>
      <td>${o.val2}</td>
      <td><strong>${o.val3}</strong></td>
    </tr>
  `).join('');
}

function exportLabManual() {
  showToast("Exporting generated PDF Practical Report with observation charts...", "success");
}

// DRAW SIMULATIONS ON CANVAS
let simAngle = 0;

function drawLabSimulation() {
  if (!canvas || !ctx) return;
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  if (state.activeLab === 'ohm') {
    drawOhmCircuit(w, h);
  } else if (state.activeLab === 'titration') {
    drawTitrationApparatus(w, h);
  } else if (state.activeLab === 'pendulum') {
    drawPendulumSimulation(w, h);
  }
}

// 1. Ohm's Law Circuit Drawing
function drawOhmCircuit(w, h) {
  const cx = w / 2;
  const cy = h / 2;

  // Circuit wires
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Loop: (cx - 200, cy - 100) -> (cx + 200, cy - 100) -> (cx + 200, cy + 100) -> (cx - 200, cy + 100) -> close
  ctx.strokeRect(cx - 200, cy - 110, 400, 220);

  // DC Voltage Source / Battery (Left wire)
  ctx.fillStyle = '#090d16';
  ctx.fillRect(cx - 215, cy - 40, 30, 80);
  
  // Battery plates
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 200, cy - 25);
  ctx.lineTo(cx - 200, cy + 25);
  ctx.stroke();

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 188, cy - 12);
  ctx.lineTo(cx - 188, cy + 12);
  ctx.stroke();

  ctx.fillStyle = '#a5b4fc';
  ctx.font = '12px Plus Jakarta Sans';
  ctx.fillText(`+ ${state.labParams.ohmVoltage}V -`, cx - 245, cy + 5);

  // Resistor / Rheostat (Top wire)
  ctx.fillStyle = '#090d16';
  ctx.fillRect(cx - 60, cy - 120, 120, 20);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 110);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(cx - 40 + i * 18, cy - 122);
    ctx.lineTo(cx - 31 + i * 18, cy - 98);
  }
  ctx.lineTo(cx + 50, cy - 110);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`R = ${state.labParams.ohmResistance} Ω`, cx - 25, cy - 130);

  // Ammeter Dial (Bottom wire)
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(cx, cy + 110, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Outfit';
  ctx.fillText("A", cx - 5, cy + 115);

  // Voltmeter connected in parallel across resistor
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cx - 80, cy - 110);
  ctx.lineTo(cx - 80, cy - 40);
  ctx.lineTo(cx + 80, cy - 40);
  ctx.lineTo(cx + 80, cy - 110);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#083344';
  ctx.beginPath();
  ctx.arc(cx, cy - 40, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.stroke();

  ctx.fillStyle = '#22d3ee';
  ctx.font = 'bold 12px Outfit';
  ctx.fillText("V", cx - 4, cy - 36);

  // Animated current electron flow dots
  const current = state.labParams.ohmVoltage / state.labParams.ohmResistance;
  ctx.fillStyle = '#38bdf8';
  const speedMultiplier = current * 2;
  const time = Date.now() * 0.003 * speedMultiplier;
  
  for (let i = 0; i < 8; i++) {
    const offset = (time + i * 0.125) % 1;
    let dotX, dotY;
    if (offset < 0.25) { // Top right
      dotX = (cx - 200) + (offset / 0.25) * 400;
      dotY = cy - 110;
    } else if (offset < 0.5) { // Right down
      dotX = cx + 200;
      dotY = (cy - 110) + ((offset - 0.25) / 0.25) * 220;
    } else if (offset < 0.75) { // Bottom left
      dotX = (cx + 200) - ((offset - 0.5) / 0.25) * 400;
      dotY = cy + 110;
    } else { // Left up
      dotX = cx - 200;
      dotY = (cy + 110) - ((offset - 0.75) / 0.25) * 220;
    }
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 2. Acid-Base Titration Apparatus Drawing
function drawTitrationApparatus(w, h) {
  const cx = w / 2;
  const baseY = h - 60;

  // Stand Base & Rod
  ctx.fillStyle = '#334155';
  ctx.fillRect(cx - 120, baseY, 240, 14);
  ctx.fillRect(cx - 70, baseY - 320, 10, 320);

  // Clamp
  ctx.fillStyle = '#64748b';
  ctx.fillRect(cx - 70, baseY - 260, 80, 10);

  // Burette (Tube)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fillRect(cx - 6, baseY - 300, 24, 180);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 6, baseY - 300, 24, 180);

  // Burette Liquid Level (NaOH remaining)
  const titrantAdded = state.labParams.titrantVolumeAdded;
  const liquidHeight = Math.max(0, 160 - (titrantAdded * 3));
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.fillRect(cx - 4, (baseY - 120) - liquidHeight, 20, liquidHeight);

  // Stopcock valve
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(cx - 10, baseY - 120, 32, 8);

  // Burette Tip
  ctx.beginPath();
  ctx.moveTo(cx + 2, baseY - 112);
  ctx.lineTo(cx + 10, baseY - 112);
  ctx.lineTo(cx + 6, baseY - 90);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fill();

  // Droplet if adding
  if (titrantAdded > 0 && titrantAdded < 50) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx + 6, baseY - 82, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Conical Erlenmeyer Flask (Flask at bottom)
  ctx.beginPath();
  ctx.moveTo(cx - 10, baseY - 65);
  ctx.lineTo(cx + 22, baseY - 65);
  ctx.lineTo(cx + 55, baseY);
  ctx.lineTo(cx - 45, baseY);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Color inside Flask based on pH
  const ph = calculateTitrationPH(titrantAdded);
  let flaskColor = 'rgba(255, 255, 255, 0.08)'; // Clear acid
  if (ph >= 8.2 && ph <= 9.0) {
    flaskColor = 'rgba(244, 114, 182, 0.55)'; // Light Pink
  } else if (ph > 9.0) {
    flaskColor = 'rgba(236, 72, 153, 0.85)'; // Deep Pink / Magenta
  }

  ctx.fillStyle = flaskColor;
  ctx.beginPath();
  ctx.moveTo(cx - 30, baseY - 35);
  ctx.lineTo(cx + 42, baseY - 35);
  ctx.lineTo(cx + 52, baseY - 2);
  ctx.lineTo(cx - 42, baseY - 2);
  ctx.closePath();
  ctx.fill();

  // Indicator Label
  ctx.fillStyle = '#f3f4f6';
  ctx.font = '12px Plus Jakarta Sans';
  ctx.fillText("Burette: 0.1M NaOH", cx + 30, baseY - 280);
  ctx.fillText(`Vol Added: ${titrantAdded.toFixed(1)} mL`, cx + 30, baseY - 260);
  ctx.fillText("Flask: 25mL HCl + Phenolphthalein", cx + 65, baseY - 35);
}

// 3. Simple Pendulum Simulation Drawing
function drawPendulumSimulation(w, h) {
  const originX = w / 2;
  const originY = 50;
  const lengthPx = state.labParams.pendulumLength * 120; // scale
  
  // Pivot Mount
  ctx.fillStyle = '#475569';
  ctx.fillRect(originX - 40, originY - 10, 80, 10);
  ctx.beginPath();
  ctx.arc(originX, originY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();

  // Angular oscillation math
  const rad = (state.labParams.pendulumAngle * Math.PI) / 180;
  const period = 2 * Math.PI * Math.sqrt(state.labParams.pendulumLength / 9.8);
  const time = Date.now() / 1000;
  const currentAngle = rad * Math.cos((2 * Math.PI / period) * time);

  const bobX = originX + lengthPx * Math.sin(currentAngle);
  const bobY = originY + lengthPx * Math.cos(currentAngle);

  // String
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(bobX, bobY);
  ctx.stroke();

  // Metallic Bob
  const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.stroke();

  // Trajectory arc
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(originX, originY, lengthPx, (Math.PI / 2) - rad, (Math.PI / 2) + rad);
  ctx.stroke();
  ctx.setLineDash([]);

  // Live Metrics
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px Plus Jakarta Sans';
  ctx.fillText(`String Length: ${state.labParams.pendulumLength} m`, originX + 70, originY + 40);
  ctx.fillText(`Period T = ${period.toFixed(3)} s`, originX + 70, originY + 60);
}

// Continuous Animation loop for simulations
function startSimulationLoop() {
  function loop() {
    if (state.currentView === 'virtuallab') {
      drawLabSimulation();
    }
    animationFrameId = requestAnimationFrame(loop);
  }
  loop();
}
startSimulationLoop();

// Setup UI Event Listeners
function setupEventListeners() {
  // Drag and drop for teacher file upload
  const dropzone = document.getElementById('fileDropzone');
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        document.getElementById('fileInput').files = e.dataTransfer.files;
        handleFileSelect({ target: { files: e.dataTransfer.files } });
      }
    });
  }

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

// Utility Helpers
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
