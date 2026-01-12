const STORAGE_KEY = "project-idea-collection.v1";
const THEME_KEY = "project-idea-collection.theme";
const UI_STATE_KEY = "project-idea-collection.ui";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad2 = (part) => String(part).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });

const ICONS = {
  edit: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  `,
  trash: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  `,
  sun: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  `,
  moon: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  `,
  circle: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
    </svg>
  `,
  checkCircle: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `,
  copy: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  `,
  log: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.6" />
      <circle cx="4" cy="12" r="1.6" />
      <circle cx="4" cy="18" r="1.6" />
    </svg>
  `,
  logOff: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="19" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.6" />
      <circle cx="4" cy="12" r="1.6" />
      <circle cx="4" cy="18" r="1.6" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  `,
  reopen: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.5 15a9 9 0 1 0 2.3-9.7L1 10" />
    </svg>
  `,
  download: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  `,
  upload: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  `,
};

// Domain layer
class Idea {
  constructor({
    id = createId(),
    text,
    done = false,
    createdAt = Date.now(),
    finishedAt = null,
  }) {
    this.id = id;
    this.text = text;
    this.done = done;
    this.createdAt = createdAt;
    this.finishedAt = finishedAt;
  }
}

class Project {
  constructor({ id = createId(), name, description = "", ideas = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ideas = ideas.map((idea) => new Idea(idea));
  }

  stats() {
    const total = this.ideas.length;
    const done = this.ideas.filter((idea) => idea.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  }
}

// Data layer
class LocalStorageProjectRepository {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed.map((project) => new Project(project));
    } catch (error) {
      console.warn("Failed to parse stored data", error);
      return [];
    }
  }

  save(projects) {
    const payload = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      ideas: project.ideas.map((idea) => ({
        id: idea.id,
        text: idea.text,
        done: idea.done,
        createdAt: idea.createdAt,
        finishedAt: idea.finishedAt,
      })),
    }));
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }
}

const createMockProjects = () => [
  new Project({
    name: "Weekend Build",
    description: "Launch a one-weekend prototype.",
    ideas: [
      { text: "Sketch 3 quick UX flows", done: true },
      { text: "Draft a one-page pitch", done: false },
      { text: "Prototype core screen", done: false },
    ],
  }),
  new Project({
    name: "Growth Experiments",
    description: "Short tests to unlock new channels.",
    ideas: [
      { text: "Interview 5 creators", done: true },
      { text: "Write launch email v1", done: false },
      { text: "Plan onboarding nudge", done: false },
      { text: "Collect waitlist insights", done: false },
    ],
  }),
];

// Use case layer
class ProjectService {
  constructor(repository) {
    this.repository = repository;
    this.projects = this.repository.load();

    if (this.projects.length === 0) {
      this.projects = createMockProjects();
      this.repository.save(this.projects);
    }
  }

  getProjects() {
    return this.projects;
  }

  getFinishedLog() {
    const entries = [];
    this.projects.forEach((project) => {
      project.ideas.forEach((idea) => {
        if (idea.done && idea.finishedAt) {
          entries.push({ projectId: project.id, projectName: project.name, idea });
        }
      });
    });
    return entries.sort(
      (a, b) => new Date(b.idea.finishedAt) - new Date(a.idea.finishedAt)
    );
  }

  createProject(name, description = "") {
    const project = new Project({
      name: name.trim(),
      description: description.trim(),
    });
    this.projects = [project, ...this.projects];
    this.repository.save(this.projects);
    return project;
  }

  exportProjects() {
    return this.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      ideas: project.ideas.map((idea) => ({
        id: idea.id,
        text: idea.text,
        done: idea.done,
        createdAt: idea.createdAt,
        finishedAt: idea.finishedAt,
      })),
    }));
  }

  importProjects(payload) {
    if (!Array.isArray(payload)) {
      throw new Error("Import data must be an array of projects.");
    }
    const projects = payload.map((project) => {
      if (!project || typeof project.name !== "string") {
        throw new Error("Each project must include a name.");
      }
      const ideas = Array.isArray(project.ideas)
        ? project.ideas
            .filter((idea) => idea && typeof idea.text === "string")
            .map((idea) => ({
              id: idea.id,
              text: idea.text,
              done: Boolean(idea.done),
              createdAt: Number.isFinite(idea.createdAt) ? idea.createdAt : Date.now(),
              finishedAt: idea.finishedAt || null,
            }))
        : [];
      return new Project({
        id: project.id,
        name: project.name,
        description: project.description || "",
        ideas,
      });
    });
    this.projects = projects;
    this.repository.save(this.projects);
    return this.projects;
  }

  updateProjectName(projectId, name) {
    const project = this.findProject(projectId);
    project.name = name.trim();
    this.repository.save(this.projects);
  }

  updateProjectDescription(projectId, description) {
    const project = this.findProject(projectId);
    project.description = description.trim();
    this.repository.save(this.projects);
  }

  deleteProject(projectId) {
    this.projects = this.projects.filter((item) => item.id !== projectId);
    this.repository.save(this.projects);
  }

  addIdea(projectId, text) {
    const project = this.findProject(projectId);
    project.ideas.unshift(new Idea({ text: text.trim() }));
    this.repository.save(this.projects);
  }

  updateIdeaText(projectId, ideaId, text) {
    const idea = this.findIdea(projectId, ideaId);
    idea.text = text.trim();
    this.repository.save(this.projects);
  }

  deleteIdea(projectId, ideaId) {
    const project = this.findProject(projectId);
    project.ideas = project.ideas.filter((idea) => idea.id !== ideaId);
    this.repository.save(this.projects);
  }

  toggleIdea(projectId, ideaId) {
    const project = this.findProject(projectId);
    const index = project.ideas.findIndex((item) => item.id === ideaId);
    if (index === -1) throw new Error("Idea not found");
    const [idea] = project.ideas.splice(index, 1);
    idea.done = !idea.done;
    idea.finishedAt = idea.done ? new Date().toISOString() : null;
    if (idea.done) {
      project.ideas.push(idea);
    } else {
      project.ideas.unshift(idea);
    }
    this.repository.save(this.projects);
  }

  moveIdea(projectId, ideaId, direction) {
    const project = this.findProject(projectId);
    const index = project.ideas.findIndex((idea) => idea.id === ideaId);
    const nextIndex = index + direction;
    if (index === -1 || nextIndex < 0 || nextIndex >= project.ideas.length) return;
    const [moved] = project.ideas.splice(index, 1);
    project.ideas.splice(nextIndex, 0, moved);
    this.repository.save(this.projects);
  }

  moveIdeaTo(projectId, ideaId, targetIdeaId) {
    const project = this.findProject(projectId);
    if (ideaId === targetIdeaId) return;
    const fromIndex = project.ideas.findIndex((idea) => idea.id === ideaId);
    const toIndex = project.ideas.findIndex((idea) => idea.id === targetIdeaId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = project.ideas.splice(fromIndex, 1);
    project.ideas.splice(toIndex, 0, moved);
    this.repository.save(this.projects);
  }

  moveProject(projectId, targetProjectId) {
    if (projectId === targetProjectId) return;
    const fromIndex = this.projects.findIndex((item) => item.id === projectId);
    const toIndex = this.projects.findIndex((item) => item.id === targetProjectId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = this.projects.splice(fromIndex, 1);
    this.projects.splice(toIndex, 0, moved);
    this.repository.save(this.projects);
  }

  findProject(projectId) {
    const project = this.projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found");
    return project;
  }

  findIdea(projectId, ideaId) {
    const project = this.findProject(projectId);
    const idea = project.ideas.find((item) => item.id === ideaId);
    if (!idea) throw new Error("Idea not found");
    return idea;
  }
}

class ThemeService {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    this.applyTheme(theme);
    return theme;
  }

  toggle() {
    const current = document.documentElement.dataset.theme || "light";
    const next = current === "dark" ? "light" : "dark";
    this.applyTheme(next);
    return next;
  }

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(this.storageKey, theme);
  }
}

class PolyBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.points = [];
    this.pointer = { x: 0, y: 0, lastMove: 0, active: false };
    this.motion = { offsetX: 0, offsetY: 0 };
    this.palette = { line: "#1f8a70", accent: "#e9b44c" };

    this.resize();
    this.createPoints();
    this.bindEvents();
    this.updatePalette();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (this.points.length) {
      this.createPoints();
    }
  }

  createPoints() {
    this.points = Array.from({ length: 48 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (event) => this.handleMove(event.clientX, event.clientY));
    window.addEventListener("mouseleave", () => {
      this.pointer.active = false;
      this.pointer.lastMove = 0;
    });
    window.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      this.handleMove(touch.clientX, touch.clientY);
    });
    window.addEventListener("touchend", () => {
      this.pointer.active = false;
      this.pointer.lastMove = 0;
    });
  }

  handleMove(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.lastMove = Date.now();
    this.pointer.active = true;
  }

  updatePalette() {
    const styles = getComputedStyle(document.documentElement);
    this.palette = {
      line: styles.getPropertyValue("--accent").trim() || "#1f8a70",
      accent: styles.getPropertyValue("--accent-2").trim() || "#e9b44c",
    };
  }

  animate() {
    const now = Date.now();
    const isMoving = now - this.pointer.lastMove < 700;
    this.pointer.active = isMoving;
    const targetX = isMoving ? (this.pointer.x - this.width / 2) * 0.07 : 0;
    const targetY = isMoving ? (this.pointer.y - this.height / 2) * 0.07 : 0;
    this.motion.offsetX += (targetX - this.motion.offsetX) * 0.03;
    this.motion.offsetY += (targetY - this.motion.offsetY) * 0.03;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updatePoints(now);
    this.drawNetwork(now);
    requestAnimationFrame(this.animate);
  }

  updatePoints(now) {
    this.points.forEach((point) => {
      point.vx += Math.sin(now / 1800 + point.phase) * 0.018;
      point.vy += Math.cos(now / 1700 + point.phase) * 0.018;
      point.vx *= 0.965;
      point.vy *= 0.965;
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > this.width) point.vx *= -1;
      if (point.y < 0 || point.y > this.height) point.vy *= -1;
    });
  }

  drawNetwork(now) {
    const maxDistance = 210;
    const scale = 0.72 + ((Math.sin(now / 4500) + 1) / 2) * 0.56;
    const centerX = this.width / 2 + this.motion.offsetX;
    const centerY = this.height / 2 + this.motion.offsetY;
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    for (let i = 0; i < this.points.length; i += 1) {
      for (let j = i + 1; j < this.points.length; j += 1) {
        const dx = this.points[i].x - this.points[j].x;
        const dy = this.points[i].y - this.points[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.7;
          this.ctx.strokeStyle = `${this.palette.line}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
          this.ctx.lineWidth = 1.4;
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[i].x, this.points[i].y);
          this.ctx.lineTo(this.points[j].x, this.points[j].y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.restore();
  }

}

// UI layer
class ProjectIdeaUI {
  constructor(service, themeService, background) {
    this.service = service;
    this.themeService = themeService;
    this.background = background;
    this.dragState = { type: null, id: null };
    const uiState = this.loadUiState();
    this.isLogVisible =
      typeof uiState.isLogVisible === "boolean" ? uiState.isLogVisible : true;
    this.activeProjectId = this.resolveActiveProjectId(uiState.activeProjectId);

    this.projectsList = document.getElementById("projectsList");
    this.projectForm = document.getElementById("projectForm");
    this.projectNameInput = document.getElementById("projectName");
    this.projectDescriptionInput = document.getElementById("projectDescription");
    this.activeProjectName = document.getElementById("activeProjectName");
    this.progressFill = document.getElementById("progressFill");
    this.progressLabel = document.getElementById("progressLabel");
    this.themeToggle = document.getElementById("themeToggle");
    this.exportButton = document.getElementById("exportData");
    this.importButton = document.getElementById("importData");
    this.importFileInput = document.getElementById("importFile");
    this.logToggle = document.getElementById("logToggle");
    this.workspace = document.querySelector(".workspace");
    this.logPanel = document.querySelector(".log-panel");
    this.logViewAll = document.getElementById("logViewAll");
    this.logDialog = document.getElementById("logDialog");
    this.logDialogClose = document.getElementById("logDialogClose");
    this.logDialogSearch = document.getElementById("logDialogSearch");
    this.logDialogProjectFilter = document.getElementById(
      "logDialogProjectFilter"
    );
    this.logDialogStart = document.getElementById("logDialogStart");
    this.logDialogEnd = document.getElementById("logDialogEnd");
    this.logDialogScroll = document.getElementById("logDialogScroll");
    this.logDialogList = document.getElementById("logDialogList");
    this.logDialogEmpty = document.getElementById("logDialogEmpty");
    this.logChartUnit = document.getElementById("logChartUnit");
    this.logChart = document.getElementById("logChart");
    this.logPieChart = document.getElementById("logPieChart");
    this.logChartNote = document.querySelector(".log-dialog-chart .chart-note");

    this.ideaForm = document.getElementById("ideaForm");
    this.ideaTextInput = document.getElementById("ideaText");
    this.ideaTabs = document.getElementById("ideaTabs");
    this.ideasList = document.getElementById("ideasList");
    this.ideasEmpty = document.getElementById("ideasEmpty");
    this.logList = document.getElementById("logList");
    this.logEmpty = document.getElementById("logEmpty");
    this.logFilter = document.getElementById("logFilter");
    this.logProjectFilter = document.getElementById("logProjectFilter");
    this.editDialog = document.getElementById("editDialog");
    this.editForm = document.getElementById("editForm");
    this.editTitle = document.getElementById("editTitle");
    this.editInput = document.getElementById("editInput");
    this.editDescriptionInput = document.getElementById("editDescription");
    this.editCancel = document.getElementById("editCancel");
    this.confirmDialog = document.getElementById("confirmDialog");
    this.confirmForm = document.getElementById("confirmForm");
    this.confirmTitle = document.getElementById("confirmTitle");
    this.confirmMessage = document.getElementById("confirmMessage");
    this.confirmCancel = document.getElementById("confirmCancel");
    this.confirmConfirm = document.getElementById("confirmConfirm");
    this.editingIdeaId = null;
    this.editingProjectId = null;
    this.editingMode = null;
    this.pendingConfirm = null;
    this.animateProjectsOnNextRender = true;
    this.animateIdeasOnNextRender = true;
    this.logFilterValue = "";
    this.logProjectFilterValue = "all";
    this.ideaFilter = this.resolveIdeaFilter(uiState.ideaFilter);
    this.logDialogEntries = [];
    this.logDialogRenderedCount = 0;
    this.logDialogBatchSize = 24;
    this.logDialogChartUnit = this.logChartUnit?.value || "month";
    this.logDialogRangeStart = null;
    this.logDialogRangeEnd = null;
    this.logChartInstance = null;
    this.logPieChartInstance = null;
    this.logChartNoteBase = this.logChartNote?.textContent || "";

    const initialTheme = this.themeService.init();
    this.updateThemeLabel(initialTheme);
    this.background.updatePalette();
    this.applyLogVisibility();
    this.updateDataButtons();
    this.persistUiState();

    this.bindEvents();
    this.render();
  }

  loadUiState() {
    const raw = localStorage.getItem(UI_STATE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Failed to parse UI state", error);
      return {};
    }
  }

  resolveActiveProjectId(projectId) {
    const projects = this.service.getProjects();
    if (!projectId) return projects[0]?.id || null;
    const matches = projects.some((project) => project.id === projectId);
    return matches ? projectId : projects[0]?.id || null;
  }

  resolveIdeaFilter(filter) {
    const allowed = ["todo", "done", "all"];
    return allowed.includes(filter) ? filter : "todo";
  }

  persistUiState() {
    const payload = {
      activeProjectId: this.activeProjectId,
      isLogVisible: this.isLogVisible,
      ideaFilter: this.ideaFilter,
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(payload));
  }

  setActiveProjectId(projectId) {
    this.activeProjectId = projectId;
    this.persistUiState();
  }

  setLogVisibility(isVisible) {
    this.isLogVisible = isVisible;
    this.persistUiState();
  }

  setIdeaFilter(filter) {
    this.ideaFilter = this.resolveIdeaFilter(filter);
    this.persistUiState();
  }

  openLogDialog() {
    this.updateLogDialogProjectFilter();
    this.applyLogDialogFilters();
    if (typeof this.logDialog.showModal === "function") {
      this.logDialog.showModal();
    } else {
      this.logDialog.setAttribute("open", "true");
    }
    requestAnimationFrame(() => {
      this.resizeLogChart();
      this.renderLogDialogChart();
    });
  }

  closeLogDialog() {
    if (this.logDialog.open) {
      this.logDialog.close();
    } else {
      this.logDialog.removeAttribute("open");
    }
  }

  updateLogDialogProjectFilter() {
    const projects = this.service.getProjects();
    const previous = this.logDialogProjectFilter.value || "all";
    this.logDialogProjectFilter.innerHTML = `<option value="all">All projects</option>`;
    projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      this.logDialogProjectFilter.appendChild(option);
    });
    const hasPrevious =
      previous !== "all" &&
      projects.some((project) => project.id === previous);
    this.logDialogProjectFilter.value = hasPrevious ? previous : "all";
  }

  parseDateInput(value, endOfDay = false) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );
  }

  applyLogDialogFilters() {
    const entries = this.service.getFinishedLog();
    const query = this.logDialogSearch.value.trim().toLowerCase();
    const projectFilter = this.logDialogProjectFilter.value;
    let start = this.parseDateInput(this.logDialogStart.value);
    let end = this.parseDateInput(this.logDialogEnd.value, true);
    if (start && end && start > end) {
      [start, end] = [end, start];
    }

    this.logDialogEntries = entries.filter(({ projectId, projectName, idea }) => {
      if (projectFilter !== "all" && projectId !== projectFilter) {
        return false;
      }
      if (query) {
        const haystack = `${projectName} ${idea.text}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      const finishedAt = new Date(idea.finishedAt);
      if (Number.isNaN(finishedAt.getTime())) return false;
      if (start && finishedAt < start) return false;
      if (end && finishedAt > end) return false;
      return true;
    });
    this.logDialogRangeStart = start;
    this.logDialogRangeEnd = end;

    this.logDialogRenderedCount = 0;
    this.logDialogList.innerHTML = "";
    this.logDialogScroll.scrollTop = 0;
    this.renderMoreLogDialogItems();
    this.updateLogDialogEmptyState();
    this.renderLogDialogChart();
  }

  updateLogDialogEmptyState() {
    const isEmpty = this.logDialogEntries.length === 0;
    this.logDialogEmpty.style.display = isEmpty ? "block" : "none";
  }

  renderMoreLogDialogItems() {
    const nextEntries = this.logDialogEntries.slice(
      this.logDialogRenderedCount,
      this.logDialogRenderedCount + this.logDialogBatchSize
    );
    if (nextEntries.length === 0) return;
    nextEntries.forEach(({ projectId, projectName, idea }) => {
      const item = document.createElement("li");
      item.className = "log-item";
      item.dataset.projectId = projectId;
      item.dataset.ideaId = idea.id;
      item.innerHTML = `
        <span>${escapeHtml(idea.text)}</span>
        <small>Finished ${formatDate(idea.finishedAt)}</small>
        <small>${escapeHtml(projectName)}</small>
        <button class="icon-button log-reopen" type="button" data-action="reopen" aria-label="Reopen idea" title="Reopen idea">
          ${ICONS.reopen}
          <span class="sr-only">Reopen</span>
        </button>
      `;
      this.logDialogList.appendChild(item);
    });
    this.logDialogRenderedCount += nextEntries.length;
  }

  handleLogDialogScroll() {
    if (this.logDialogRenderedCount >= this.logDialogEntries.length) return;
    const { scrollTop, clientHeight, scrollHeight } = this.logDialogScroll;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      this.renderMoreLogDialogItems();
    }
  }

  getWeekNumber(date) {
    const target = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
    return { year: target.getUTCFullYear(), week };
  }

  getBucketStart(date, unit) {
    const start = new Date(date);
    if (unit === "day") {
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (unit === "week") {
      const day = start.getDay();
      const diff = (day + 6) % 7;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (unit === "month") {
      return new Date(start.getFullYear(), start.getMonth(), 1);
    }
    return new Date(start.getFullYear(), 0, 1);
  }

  formatBucketLabel(date, unit) {
    const pad2 = (value) => String(value).padStart(2, "0");
    if (unit === "day") {
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
        date.getDate()
      )}`;
    }
    if (unit === "week") {
      const { year, week } = this.getWeekNumber(date);
      return `${year} W${pad2(week)}`;
    }
    if (unit === "month") {
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
    }
    return `${date.getFullYear()}`;
  }

  buildLogDialogBuckets(entries, unit) {
    const buckets = new Map();
    entries.forEach(({ idea }) => {
      const finishedAt = new Date(idea.finishedAt);
      if (Number.isNaN(finishedAt.getTime())) return;
      const start = this.getBucketStart(finishedAt, unit);
      const key = start.getTime();
      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, {
          label: this.formatBucketLabel(start, unit),
          count: 1,
        });
      }
    });
    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);
  }

  getChartEndDate() {
    if (this.logDialogRangeEnd) return this.logDialogRangeEnd;
    if (this.logDialogEntries.length > 0) {
      const latest = this.logDialogEntries.reduce((max, { idea }) => {
        const finishedAt = new Date(idea.finishedAt).getTime();
        if (Number.isNaN(finishedAt)) return max;
        return Math.max(max, finishedAt);
      }, 0);
      if (latest) return new Date(latest);
    }
    return new Date();
  }

  buildLogDialogBucketsWindow(entries, unit, endDate) {
    const counts = new Map();
    entries.forEach(({ idea }) => {
      const finishedAt = new Date(idea.finishedAt);
      if (Number.isNaN(finishedAt.getTime())) return;
      const start = this.getBucketStart(finishedAt, unit);
      const key = start.getTime();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const windowSizes = {
      day: 7,
      week: 4,
      month: 6,
      year: 3,
    };
    const total = windowSizes[unit] || 6;
    const endStart = this.getBucketStart(endDate, unit);
    const buckets = [];
    for (let index = 0; index < total; index += 1) {
      const offset = total - 1 - index;
      let start;
      if (unit === "day") {
        start = new Date(endStart);
        start.setDate(start.getDate() - offset);
      } else if (unit === "week") {
        start = new Date(endStart);
        start.setDate(start.getDate() - offset * 7);
      } else if (unit === "month") {
        start = new Date(endStart.getFullYear(), endStart.getMonth(), 1);
        start.setMonth(start.getMonth() - offset);
      } else {
        start = new Date(endStart.getFullYear() - offset, 0, 1);
      }
      const key = start.getTime();
      buckets.push({
        label: this.formatBucketLabel(start, unit),
        count: counts.get(key) || 0,
      });
    }
    return buckets;
  }

  getLogChartTheme() {
    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.dataset.theme === "dark";
    return {
      isDark,
      accent: styles.getPropertyValue("--accent").trim() || "#1f8a70",
      accentAlt: styles.getPropertyValue("--accent-2").trim() || "#e9b44c",
      muted: styles.getPropertyValue("--muted").trim() || "#5b6473",
      border:
        styles.getPropertyValue("--border").trim() || "rgba(0, 0, 0, 0.08)",
      surface: styles.getPropertyValue("--surface").trim() || "#ffffff",
      ink: styles.getPropertyValue("--ink").trim() || "#0d1b2a",
    };
  }

  parseHexColor(value) {
    if (!value) return null;
    const hex = value.trim().replace("#", "");
    if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) return null;
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    const int = parseInt(normalized, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255,
    };
  }

  rgbToHsl({ r, g, b }) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta) % 6;
      } else if (max === gNorm) {
        h = (bNorm - rNorm) / delta + 2;
      } else {
        h = (rNorm - gNorm) / delta + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  buildPieColors(count, theme) {
    const base = this.parseHexColor(theme.accent) || {
      r: 31,
      g: 138,
      b: 112,
    };
    const { h, s } = this.rgbToHsl(base);
    const baseLight = theme.isDark ? 62 : 46;
    const saturation = Math.max(50, s);
    const colors = Array.from({ length: count }, (_, index) => {
      const hue = Math.round((h + index * 36) % 360);
      const lightness = Math.min(72, baseLight + (index % 4) * 6);
      return `hsl(${hue} ${saturation}% ${lightness}%)`;
    });
    if (count > 1 && theme.accentAlt) {
      colors[1] = theme.accentAlt;
    }
    return colors;
  }

  buildLogDialogPieData(entries) {
    const counts = new Map();
    entries.forEach(({ projectName }) => {
      if (!projectName) return;
      counts.set(projectName, (counts.get(projectName) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  updateLogChartNote(totalCount) {
    if (!this.logChartNote) return;
    if (totalCount === 0) {
      this.logChartNote.textContent = "No data yet.";
      return;
    }
    this.logChartNote.textContent = this.logChartNoteBase;
  }

  buildLogChartConfig(labels, data, theme) {
    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: theme.accent,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 320,
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: theme.muted,
              font: {
                size: 10,
              },
              maxTicksLimit: 6,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: theme.border,
            },
            ticks: {
              color: theme.muted,
              font: {
                size: 10,
              },
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: theme.surface,
            titleColor: theme.ink,
            bodyColor: theme.ink,
            borderColor: theme.border,
            borderWidth: 1,
            displayColors: false,
          },
        },
      },
    };
  }

  buildLogPieChartConfig(labels, data, theme, colors) {
    return {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: theme.surface,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 320,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: theme.muted,
              font: {
                size: 11,
              },
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: theme.surface,
            titleColor: theme.ink,
            bodyColor: theme.ink,
            borderColor: theme.border,
            borderWidth: 1,
            displayColors: false,
          },
        },
      },
    };
  }

  ensureLogChartInstance(labels, data, theme) {
    if (!this.logChart || typeof Chart === "undefined") return null;
    if (!this.logChartInstance) {
      this.logChartInstance = new Chart(
        this.logChart,
        this.buildLogChartConfig(labels, data, theme)
      );
    }
    return this.logChartInstance;
  }

  ensureLogPieChartInstance(labels, data, theme, colors) {
    if (!this.logPieChart || typeof Chart === "undefined") return null;
    if (!this.logPieChartInstance) {
      this.logPieChartInstance = new Chart(
        this.logPieChart,
        this.buildLogPieChartConfig(labels, data, theme, colors)
      );
    }
    return this.logPieChartInstance;
  }

  resizeLogChart() {
    if (this.logChartInstance) {
      this.logChartInstance.resize();
    }
    if (this.logPieChartInstance) {
      this.logPieChartInstance.resize();
    }
  }

  renderLogDialogChart() {
    if (!this.logChart || typeof Chart === "undefined") return;
    const unit = this.logChartUnit?.value || this.logDialogChartUnit;
    const endDate = this.getChartEndDate();
    const buckets = this.buildLogDialogBucketsWindow(
      this.logDialogEntries,
      unit,
      endDate
    );
    const labels = buckets.map((item) => item.label);
    const data = buckets.map((item) => item.count);
    const totalCount = data.reduce((sum, value) => sum + value, 0);
    const theme = this.getLogChartTheme();
    const chart = this.ensureLogChartInstance(labels, data, theme);
    if (!chart) return;

    this.updateLogChartNote(totalCount);
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = theme.accent;
    chart.options.scales.x.ticks.color = theme.muted;
    chart.options.scales.y.ticks.color = theme.muted;
    chart.options.scales.y.grid.color = theme.border;
    chart.options.plugins.tooltip.backgroundColor = theme.surface;
    chart.options.plugins.tooltip.titleColor = theme.ink;
    chart.options.plugins.tooltip.bodyColor = theme.ink;
    chart.options.plugins.tooltip.borderColor = theme.border;
    chart.update();

    const pieSeries = this.buildLogDialogPieData(this.logDialogEntries);
    const pieLabels = pieSeries.map((item) => item.label);
    const pieValues = pieSeries.map((item) => item.count);
    const pieColors = this.buildPieColors(pieLabels.length, theme);
    const pieChart = this.ensureLogPieChartInstance(
      pieLabels,
      pieValues,
      theme,
      pieColors
    );
    if (!pieChart) return;
    pieChart.data.labels = pieLabels;
    pieChart.data.datasets[0].data = pieValues;
    pieChart.data.datasets[0].backgroundColor = pieColors;
    pieChart.data.datasets[0].borderColor = theme.surface;
    pieChart.options.plugins.legend.display = pieLabels.length > 0;
    pieChart.options.plugins.legend.labels.color = theme.muted;
    pieChart.options.plugins.tooltip.backgroundColor = theme.surface;
    pieChart.options.plugins.tooltip.titleColor = theme.ink;
    pieChart.options.plugins.tooltip.bodyColor = theme.ink;
    pieChart.options.plugins.tooltip.borderColor = theme.border;
    pieChart.update();
  }

  bindEvents() {
    this.projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = this.projectNameInput.value.trim();
      if (!name) return;
      const description = this.projectDescriptionInput.value.trim();
      const project = this.service.createProject(name, description);
      this.animateProjectsOnNextRender = true;
      this.projectNameInput.value = "";
      this.projectDescriptionInput.value = "";
      this.setActiveProjectId(project.id);
      this.render();
    });

    this.projectsList.addEventListener("click", (event) => {
      const actionButton = event.target.closest("button[data-action]");
      if (actionButton) {
        const card = actionButton.closest(".project-card");
        if (!card) return;
        const projectId = card.dataset.id;
        const action = actionButton.dataset.action;

        if (action === "edit-project") {
          const project = this.service.findProject(projectId);
          this.openEditDialog({
            mode: "project",
            id: project.id,
            text: project.name,
            description: project.description,
            title: "Edit project",
            maxLength: 50,
          });
          return;
        }
        if (action === "delete-project") {
          const project = this.service.findProject(projectId);
          this.openConfirmDialog({
            title: "Delete project",
            message: `Delete "${project.name}"?`,
            confirmText: "Delete project",
            onConfirm: () => {
              this.service.deleteProject(projectId);
              this.animateProjectsOnNextRender = true;
              if (this.activeProjectId === projectId) {
                this.setActiveProjectId(
                  this.service.getProjects()[0]?.id || null
                );
              }
              this.render();
            },
          });
        }
        return;
      }

      const card = event.target.closest(".project-card");
      if (!card) return;
      this.setActiveProjectId(card.dataset.id);
      this.render();
    });

    this.projectsList.addEventListener("dragstart", (event) => {
      const card = event.target.closest(".project-card");
      if (!card) return;
      this.dragState = { type: "project", id: card.dataset.id };
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.id);
    });

    this.projectsList.addEventListener("dragend", (event) => {
      const card = event.target.closest(".project-card");
      card?.classList.remove("dragging");
      this.dragState = { type: null, id: null };
    });

    this.projectsList.addEventListener("dragover", (event) => {
      const card = event.target.closest(".project-card");
      if (!card || this.dragState.type !== "project") return;
      event.preventDefault();
    });

    this.projectsList.addEventListener("drop", (event) => {
      const card = event.target.closest(".project-card");
      if (!card || this.dragState.type !== "project") return;
      event.preventDefault();
      this.service.moveProject(this.dragState.id, card.dataset.id);
      this.render();
    });

    this.ideaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this.activeProjectId) return;
      const text = this.ideaTextInput.value.trim();
      if (!text) return;
      this.service.addIdea(this.activeProjectId, text);
      this.animateIdeasOnNextRender = true;
      this.ideaTextInput.value = "";
      this.render();
    });

    this.ideaTabs.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      this.setIdeaFilter(button.dataset.filter);
      this.renderIdeas();
    });

    this.ideasList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || !this.activeProjectId) return;
      const ideaId = button.closest("li")?.dataset.id;
      if (!ideaId) return;
      const action = button.dataset.action;

      if (action === "toggle") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
        if (idea.done) {
          this.openConfirmDialog({
            title: "Reopen idea",
            message: `Reopen "${idea.text}"?`,
            confirmText: "Reopen idea",
            onConfirm: () => {
              this.service.toggleIdea(this.activeProjectId, ideaId);
              this.animateIdeasOnNextRender = false;
              this.render();
            },
          });
        } else {
          this.service.toggleIdea(this.activeProjectId, ideaId);
          this.animateIdeasOnNextRender = false;
          this.render();
        }
        return;
      }
      if (action === "copy") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
        this.copyIdeaText(idea.text);
        return;
      }
      if (action === "edit") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
          this.openEditDialog({
            mode: "idea",
            id: idea.id,
            text: idea.text,
            title: "Edit idea",
            maxLength: 160,
          });
        return;
      }
      if (action === "delete") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
        this.openConfirmDialog({
          title: "Delete idea",
          message: `Delete "${idea.text}"?`,
          confirmText: "Delete idea",
          onConfirm: () => {
            this.service.deleteIdea(this.activeProjectId, ideaId);
            this.animateIdeasOnNextRender = true;
            this.render();
          },
        });
        return;
      }

      this.render();
    });

    this.ideasList.addEventListener("dragstart", (event) => {
      const item = event.target.closest(".idea-item");
      if (!item) return;
      this.dragState = { type: "idea", id: item.dataset.id };
      item.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", item.dataset.id);
    });

    this.ideasList.addEventListener("dragend", (event) => {
      const item = event.target.closest(".idea-item");
      item?.classList.remove("dragging");
      this.dragState = { type: null, id: null };
    });

    this.ideasList.addEventListener("dragover", (event) => {
      const item = event.target.closest(".idea-item");
      if (!item || this.dragState.type !== "idea") return;
      event.preventDefault();
    });

    this.ideasList.addEventListener("drop", (event) => {
      const item = event.target.closest(".idea-item");
      if (!item || this.dragState.type !== "idea" || !this.activeProjectId) return;
      event.preventDefault();
      this.service.moveIdeaTo(this.activeProjectId, this.dragState.id, item.dataset.id);
      this.render();
    });

    this.themeToggle.addEventListener("click", () => {
      const theme = this.themeService.toggle();
      this.updateThemeLabel(theme);
      this.background.updatePalette();
      if (this.logDialog.open || this.logDialog.hasAttribute("open")) {
        this.renderLogDialogChart();
      }
    });

    this.exportButton.addEventListener("click", () => {
      const data = this.service.exportProjects();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `project-ideas-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    this.importButton.addEventListener("click", () => {
      this.importFileInput.value = "";
      this.importFileInput.click();
    });

    this.importFileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const payload = JSON.parse(reader.result);
          this.openConfirmDialog({
            title: "Import data",
            message: "Importing will replace all current projects and ideas. Continue?",
            confirmText: "Import data",
            onConfirm: () => {
              this.applyImport(payload);
            },
          });
        } catch (error) {
          window.alert("Import failed. Please select a valid JSON file.");
        }
      };
      reader.readAsText(file);
    });

    this.logToggle.addEventListener("click", () => {
      this.setLogVisibility(!this.isLogVisible);
      this.applyLogVisibility();
    });

    this.logViewAll.addEventListener("click", () => {
      this.openLogDialog();
    });

    this.logDialogClose.addEventListener("click", () => {
      this.closeLogDialog();
    });

    this.logDialog.addEventListener("click", (event) => {
      if (event.target === this.logDialog) {
        this.closeLogDialog();
      }
    });

    this.logDialogSearch.addEventListener("input", () => {
      this.applyLogDialogFilters();
    });

    this.logDialogProjectFilter.addEventListener("change", () => {
      this.applyLogDialogFilters();
    });

    this.logDialogStart.addEventListener("change", () => {
      this.applyLogDialogFilters();
    });

    this.logDialogEnd.addEventListener("change", () => {
      this.applyLogDialogFilters();
    });

    this.logChartUnit.addEventListener("change", () => {
      this.logDialogChartUnit = this.logChartUnit.value;
      this.renderLogDialogChart();
    });

    this.logDialogScroll.addEventListener("scroll", () => {
      this.handleLogDialogScroll();
    });

    this.logDialogList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action !== "reopen") return;
      const item = button.closest(".log-item");
      const projectId = item?.dataset.projectId;
      const ideaId = item?.dataset.ideaId;
      if (!projectId || !ideaId) return;
      const idea = this.service.findIdea(projectId, ideaId);
      this.openConfirmDialog({
        title: "Reopen idea",
        message: `Reopen "${idea.text}"?`,
        confirmText: "Reopen idea",
        onConfirm: () => {
          this.service.toggleIdea(projectId, ideaId);
          if (this.activeProjectId === projectId) {
            this.animateIdeasOnNextRender = false;
          }
          this.applyLogDialogFilters();
          this.render();
        },
      });
    });

    window.addEventListener("resize", () => {
      if (this.logDialog.open || this.logDialog.hasAttribute("open")) {
        this.resizeLogChart();
        this.renderLogDialogChart();
      }
    });

    this.logFilter.addEventListener("input", (event) => {
      this.logFilterValue = event.target.value.trim().toLowerCase();
      this.renderLog();
    });

    this.logProjectFilter.addEventListener("change", (event) => {
      this.logProjectFilterValue = event.target.value;
      this.renderLog();
    });

    this.logList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;
      if (action !== "reopen") return;
      const item = button.closest(".log-item");
      const projectId = item?.dataset.projectId;
      const ideaId = item?.dataset.ideaId;
      if (!projectId || !ideaId) return;
      const idea = this.service.findIdea(projectId, ideaId);
      this.openConfirmDialog({
        title: "Reopen idea",
        message: `Reopen "${idea.text}"?`,
        confirmText: "Reopen idea",
        onConfirm: () => {
          this.service.toggleIdea(projectId, ideaId);
          if (this.activeProjectId === projectId) {
            this.animateIdeasOnNextRender = false;
          }
          this.render();
        },
      });
    });

    this.editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = this.editInput.value.trim();
      if (!text) {
        this.closeEditDialog();
        return;
      }

      if (this.editingMode === "idea" && this.activeProjectId && this.editingIdeaId) {
        this.service.updateIdeaText(this.activeProjectId, this.editingIdeaId, text);
        this.animateIdeasOnNextRender = true;
      }

      if (this.editingMode === "project" && this.editingProjectId) {
        this.service.updateProjectName(this.editingProjectId, text);
        this.service.updateProjectDescription(
          this.editingProjectId,
          this.editDescriptionInput.value
        );
        this.animateProjectsOnNextRender = true;
      }

      this.closeEditDialog();
      this.render();
    });

    this.editCancel.addEventListener("click", () => {
      this.closeEditDialog();
    });

    this.editDialog.addEventListener("click", (event) => {
      if (event.target === this.editDialog) {
        this.closeEditDialog();
      }
    });

    this.confirmForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this.pendingConfirm) {
        this.pendingConfirm();
      }
      this.closeConfirmDialog();
    });

    this.confirmCancel.addEventListener("click", () => {
      this.closeConfirmDialog();
    });

    this.confirmDialog.addEventListener("click", (event) => {
      if (event.target === this.confirmDialog) {
        this.closeConfirmDialog();
      }
    });
  }

  updateThemeLabel(theme) {
    const label = theme === "dark" ? "Light mode" : "Dark mode";
    const icon = theme === "dark" ? ICONS.sun : ICONS.moon;
    this.themeToggle.innerHTML = `${icon}<span class="sr-only">${label}</span>`;
    this.themeToggle.setAttribute("aria-label", label);
    this.themeToggle.title = label;
  }

  updateDataButtons() {
    this.exportButton.innerHTML = `${ICONS.download}<span class="sr-only">Export data</span>`;
    this.exportButton.setAttribute("aria-label", "Export data");
    this.exportButton.title = "Export data";

    this.importButton.innerHTML = `${ICONS.upload}<span class="sr-only">Import data</span>`;
    this.importButton.setAttribute("aria-label", "Import data");
    this.importButton.title = "Import data";
  }

  updateLogToggleLabel() {
    const label = this.isLogVisible ? "Hide log" : "Show log";
    const icon = this.isLogVisible ? ICONS.logOff : ICONS.log;
    this.logToggle.innerHTML = `${icon}<span class="sr-only">${label}</span>`;
    this.logToggle.setAttribute("aria-label", label);
    this.logToggle.setAttribute("aria-pressed", this.isLogVisible);
    this.logToggle.title = label;
  }

  applyLogVisibility() {
    this.logPanel.classList.toggle("is-hidden", !this.isLogVisible);
    this.workspace.classList.toggle("log-hidden", !this.isLogVisible);
    this.updateLogToggleLabel();
  }

  applyImport(payload) {
    try {
      this.service.importProjects(payload);
      this.setActiveProjectId(this.service.getProjects()[0]?.id || null);
      this.animateProjectsOnNextRender = true;
      this.animateIdeasOnNextRender = true;
      this.render();
    } catch (error) {
      window.alert("Import failed. Please check the file format.");
    }
  }

  openEditDialog({ mode, id, text, description = "", title, maxLength }) {
    if (!id) return;
    this.editingMode = mode;
    this.editingIdeaId = mode === "idea" ? id : null;
    this.editingProjectId = mode === "project" ? id : null;
    this.editTitle.textContent = title;
    this.editInput.value = text;
    this.editInput.maxLength = maxLength || 80;
    const showDescription = mode === "project";
    this.editDescriptionInput.classList.toggle("hidden", !showDescription);
    this.editDescriptionInput.value = showDescription ? description : "";

    if (typeof this.editDialog.showModal === "function") {
      this.editDialog.showModal();
      this.editInput.focus();
      this.editInput.select();
    } else {
      const nextText = window.prompt(title, text);
      if (nextText !== null && nextText.trim()) {
        if (mode === "idea" && this.activeProjectId) {
          this.service.updateIdeaText(this.activeProjectId, id, nextText);
          this.animateIdeasOnNextRender = true;
          this.render();
          this.closeEditDialog();
          return;
        }
        if (mode === "project") {
          const nextDescription = window.prompt(
            "Project description (optional)",
            description
          );
          this.service.updateProjectName(id, nextText);
          if (nextDescription !== null) {
            this.service.updateProjectDescription(id, nextDescription);
          }
          this.animateProjectsOnNextRender = true;
          this.render();
          this.closeEditDialog();
          return;
        }
      }
      this.closeEditDialog();
    }
  }

  closeEditDialog() {
    if (this.editDialog.open) {
      this.editDialog.close();
    }
    this.editingMode = null;
    this.editingIdeaId = null;
    this.editingProjectId = null;
    this.editTitle.textContent = "Edit idea";
    this.editInput.value = "";
    this.editDescriptionInput.value = "";
    this.editDescriptionInput.classList.add("hidden");
  }

  openConfirmDialog({ title, message, confirmText, onConfirm }) {
    this.confirmTitle.textContent = title;
    this.confirmMessage.textContent = message;
    this.confirmConfirm.textContent = confirmText || "Delete";
    this.pendingConfirm = onConfirm;

    if (typeof this.confirmDialog.showModal === "function") {
      this.confirmDialog.showModal();
    } else {
      this.confirmDialog.setAttribute("open", "true");
    }
  }

  closeConfirmDialog() {
    if (this.confirmDialog.open) {
      this.confirmDialog.close();
    } else {
      this.confirmDialog.removeAttribute("open");
    }
    this.pendingConfirm = null;
    this.confirmTitle.textContent = "Delete";
    this.confirmMessage.textContent = "";
    this.confirmConfirm.textContent = "Delete";
  }

  copyIdeaText(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        this.copyIdeaTextFallback(text);
      });
      return;
    }
    this.copyIdeaTextFallback(text);
  }

  copyIdeaTextFallback(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      console.warn("Copy failed", error);
    }
    document.body.removeChild(textarea);
  }

  updateIdeaTabs(stats) {
    const buttons = Array.from(this.ideaTabs.querySelectorAll("button[data-filter]"));
    const counts = {
      todo: stats.total - stats.done,
      done: stats.done,
      all: stats.total,
    };
    buttons.forEach((button) => {
      const filter = button.dataset.filter;
      const isActive = filter === this.ideaFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive);
      const countSpan = button.querySelector(".tab-count");
      if (countSpan && filter in counts) {
        countSpan.textContent = counts[filter];
      }
    });
  }

  filterIdeas(ideas) {
    if (this.ideaFilter === "done") {
      return ideas.filter((idea) => idea.done);
    }
    if (this.ideaFilter === "all") {
      return ideas;
    }
    return ideas.filter((idea) => !idea.done);
  }

  getIdeasEmptyMessage() {
    if (this.ideaFilter === "done") {
      return "No finished ideas yet.";
    }
    if (this.ideaFilter === "all") {
      return "Add an idea and keep the momentum going.";
    }
    return "Add an idea and keep the momentum going.";
  }

  render() {
    this.renderProjects();
    this.renderIdeas();
    this.renderLog();
  }

  renderProjects() {
    const projects = this.service.getProjects();
    this.projectsList.innerHTML = "";
    const shouldAnimate = this.animateProjectsOnNextRender;
    this.animateProjectsOnNextRender = false;

    if (projects.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Create your first project to get started.";
      this.projectsList.appendChild(empty);
      return;
    }

    projects.forEach((project, index) => {
      const stats = project.stats();
      const hasOpenIdeas = stats.total > 0 && stats.done < stats.total;
      const description = (project.description || "").trim();
      const descriptionMarkup = description
        ? `<p class="project-description">${escapeHtml(description)}</p>`
        : "";
      const liveIndicator = hasOpenIdeas
        ? '<span class="project-live" aria-hidden="true"></span>'
        : "";
      const card = document.createElement("div");
      card.className = shouldAnimate ? "project-card fade-in" : "project-card";
      if (shouldAnimate) {
        card.style.setProperty("--fade-delay", `${index * 40}ms`);
      }
      card.draggable = true;
      if (project.id === this.activeProjectId) {
        card.classList.add("active");
      }
      card.dataset.id = project.id;
      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-title-block">
            <div class="project-title-row">
              <h3>${escapeHtml(project.name)}</h3>
              ${liveIndicator}
            </div>
            ${descriptionMarkup}
          </div>
          <div class="project-actions">
            <button class="icon-button" type="button" data-action="edit-project" aria-label="Edit project" title="Edit project">
              ${ICONS.edit}
              <span class="sr-only">Edit</span>
            </button>
            <button class="icon-button" type="button" data-action="delete-project" aria-label="Delete project" title="Delete project">
              ${ICONS.trash}
              <span class="sr-only">Delete</span>
            </button>
          </div>
        </div>
        <div class="project-meta">
          <span>${stats.done}/${stats.total} complete</span>
          <span>${stats.percent}%</span>
        </div>
        <div class="progress-track" style="margin-top:10px;">
          <div class="progress-fill" style="width:${stats.percent}%;"></div>
        </div>
      `;
      this.projectsList.appendChild(card);
    });
  }

  renderIdeas() {
    const project = this.activeProjectId
      ? this.service.getProjects().find((item) => item.id === this.activeProjectId)
      : null;
    const shouldAnimate = this.animateIdeasOnNextRender;
    this.animateIdeasOnNextRender = false;

    if (!project) {
      this.activeProjectName.textContent = "Select a project";
      this.progressFill.style.width = "0%";
      this.progressLabel.textContent = "0%";
      this.ideaForm.classList.add("hidden");
      this.ideaTabs.classList.add("hidden");
      this.ideasList.innerHTML = "";
      this.ideasEmpty.style.display = "block";
      return;
    }

    this.ideaForm.classList.remove("hidden");
    this.ideaTabs.classList.remove("hidden");
    this.activeProjectName.textContent = project.name;
    const stats = project.stats();
    this.progressFill.style.width = `${stats.percent}%`;
    this.progressLabel.textContent = `${stats.percent}%`;

    this.ideasList.innerHTML = "";

    this.updateIdeaTabs(stats);
    const visibleIdeas = this.filterIdeas(project.ideas);

    if (visibleIdeas.length === 0) {
      this.ideasEmpty.style.display = "block";
      this.ideasEmpty.textContent = this.getIdeasEmptyMessage();
      return;
    }

    this.ideasEmpty.style.display = "none";

    visibleIdeas.forEach((idea, index) => {
      const item = document.createElement("li");
      item.className = shouldAnimate ? "idea-item fade-in" : "idea-item";
      if (shouldAnimate) {
        item.style.setProperty("--fade-delay", `${index * 30}ms`);
      }
      item.draggable = true;
      if (idea.done) item.classList.add("completed");
      item.dataset.id = idea.id;
      const finishedLabel = idea.done && idea.finishedAt ? formatDate(idea.finishedAt) : "";
      const createdLabel = formatDate(idea.createdAt);
      const toggleLabel = idea.done ? "Reopen" : "Mark complete";
      const toggleIcon = idea.done ? ICONS.reopen : ICONS.check;
      item.innerHTML = `
        <span class="idea-text">
          <span class="idea-title">${escapeHtml(idea.text)}</span>
          <small>Created ${createdLabel}</small>
          ${finishedLabel ? `<small>Finished ${finishedLabel}</small>` : ""}
        </span>
        <div class="idea-actions">
          <button class="icon-button toggle-button" type="button" data-action="toggle" aria-pressed="${idea.done}" aria-label="${toggleLabel}" title="${toggleLabel}">
            ${toggleIcon}
            <span class="sr-only">${toggleLabel}</span>
          </button>
          <button class="icon-button" type="button" data-action="copy" aria-label="Copy idea" title="Copy idea">
            ${ICONS.copy}
            <span class="sr-only">Copy</span>
          </button>
          <button class="icon-button" type="button" data-action="edit" aria-label="Edit idea" title="Edit idea">
            ${ICONS.edit}
            <span class="sr-only">Edit</span>
          </button>
          <button class="icon-button" type="button" data-action="delete" aria-label="Delete idea" title="Delete idea">
            ${ICONS.trash}
            <span class="sr-only">Delete</span>
          </button>
        </div>
      `;
      this.ideasList.appendChild(item);
    });
  }

  renderLog() {
    const entries = this.service.getFinishedLog();
    this.logList.innerHTML = "";
    const projects = this.service.getProjects();
    const previousProjectFilter = this.logProjectFilterValue;
    this.logProjectFilter.innerHTML = `<option value="all">All projects</option>`;
    projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      this.logProjectFilter.appendChild(option);
    });
    const hasProjectFilter =
      previousProjectFilter !== "all" &&
      projects.some((project) => project.id === previousProjectFilter);
    this.logProjectFilterValue = hasProjectFilter ? previousProjectFilter : "all";
    this.logProjectFilter.value = this.logProjectFilterValue;

    const query = this.logFilterValue;
    const filteredEntries = entries.filter(({ projectId, projectName, idea }) => {
      if (this.logProjectFilterValue !== "all" && projectId !== this.logProjectFilterValue) {
        return false;
      }
      if (!query) return true;
      const haystack = `${projectName} ${idea.text}`.toLowerCase();
      return haystack.includes(query);
    });
    const visibleEntries = filteredEntries.slice(0, 5);
    const hasEntries = entries.length > 5;
    this.logViewAll.disabled = !hasEntries;
    this.logViewAll.classList.toggle("hidden", !hasEntries);

    if (visibleEntries.length === 0) {
      this.logEmpty.style.display = "block";
      return;
    }

    this.logEmpty.style.display = "none";
    visibleEntries.forEach(({ projectId, projectName, idea }) => {
      const item = document.createElement("li");
      item.className = "log-item";
      item.dataset.projectId = projectId;
      item.dataset.ideaId = idea.id;
      item.innerHTML = `
        <span>${escapeHtml(idea.text)}</span>
        <small>Finished ${formatDate(idea.finishedAt)}</small>
        <small>${escapeHtml(projectName)}</small>
        <button class="icon-button log-reopen" type="button" data-action="reopen" aria-label="Reopen idea" title="Reopen idea">
          ${ICONS.reopen}
          <span class="sr-only">Reopen</span>
        </button>
      `;
      this.logList.appendChild(item);
    });
  }
}

const repository = new LocalStorageProjectRepository(STORAGE_KEY);
const service = new ProjectService(repository);
const themeService = new ThemeService(THEME_KEY);
const background = new PolyBackground(document.getElementById("bgCanvas"));
new ProjectIdeaUI(service, themeService, background);
