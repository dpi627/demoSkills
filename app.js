const STORAGE_KEY = "project-idea-collection.v1";
const THEME_KEY = "project-idea-collection.theme";

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
  constructor({ id = createId(), name, ideas = [] }) {
    this.id = id;
    this.name = name;
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
    ideas: [
      { text: "Sketch 3 quick UX flows", done: true },
      { text: "Draft a one-page pitch", done: false },
      { text: "Prototype core screen", done: false },
    ],
  }),
  new Project({
    name: "Growth Experiments",
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

  createProject(name) {
    const project = new Project({ name: name.trim() });
    this.projects = [project, ...this.projects];
    this.repository.save(this.projects);
    return project;
  }

  updateProjectName(projectId, name) {
    const project = this.findProject(projectId);
    project.name = name.trim();
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
    this.points = Array.from({ length: 36 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
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
      point.vx += Math.sin(now / 1800 + point.phase) * 0.012;
      point.vy += Math.cos(now / 1700 + point.phase) * 0.012;
      point.vx *= 0.965;
      point.vy *= 0.965;
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > this.width) point.vx *= -1;
      if (point.y < 0 || point.y > this.height) point.vy *= -1;
    });
  }

  drawNetwork(now) {
    const maxDistance = 170;
    const scale = 0.7 + ((Math.sin(now / 4500) + 1) / 2) * 0.5;
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
          const alpha = (1 - dist / maxDistance) * 0.45;
          this.ctx.strokeStyle = `${this.palette.line}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
          this.ctx.lineWidth = 1.2;
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
    this.activeProjectId = service.getProjects()[0]?.id || null;
    this.dragState = { type: null, id: null };

    this.projectsList = document.getElementById("projectsList");
    this.projectForm = document.getElementById("projectForm");
    this.projectNameInput = document.getElementById("projectName");
    this.activeProjectName = document.getElementById("activeProjectName");
    this.progressFill = document.getElementById("progressFill");
    this.progressLabel = document.getElementById("progressLabel");
    this.themeToggle = document.getElementById("themeToggle");
    this.logToggle = document.getElementById("logToggle");
    this.workspace = document.querySelector(".workspace");
    this.logPanel = document.querySelector(".log-panel");

    this.ideaForm = document.getElementById("ideaForm");
    this.ideaTextInput = document.getElementById("ideaText");
    this.ideasList = document.getElementById("ideasList");
    this.ideasEmpty = document.getElementById("ideasEmpty");
    this.logList = document.getElementById("logList");
    this.logEmpty = document.getElementById("logEmpty");
    this.logFilter = document.getElementById("logFilter");
    this.editDialog = document.getElementById("editDialog");
    this.editForm = document.getElementById("editForm");
    this.editTitle = document.getElementById("editTitle");
    this.editInput = document.getElementById("editInput");
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
    this.isLogVisible = true;
    this.logFilterValue = "";

    const initialTheme = this.themeService.init();
    this.updateThemeLabel(initialTheme);
    this.background.updatePalette();
    this.applyLogVisibility();

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = this.projectNameInput.value.trim();
      if (!name) return;
      const project = this.service.createProject(name);
      this.animateProjectsOnNextRender = true;
      this.projectNameInput.value = "";
      this.activeProjectId = project.id;
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
                this.activeProjectId = this.service.getProjects()[0]?.id || null;
              }
              this.render();
            },
          });
        }
        return;
      }

      const card = event.target.closest(".project-card");
      if (!card) return;
      this.activeProjectId = card.dataset.id;
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

    this.ideasList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || !this.activeProjectId) return;
      const ideaId = button.closest("li")?.dataset.id;
      if (!ideaId) return;
      const action = button.dataset.action;

      if (action === "toggle") {
        this.service.toggleIdea(this.activeProjectId, ideaId);
        this.animateIdeasOnNextRender = false;
        this.render();
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
    });

    this.logToggle.addEventListener("click", () => {
      this.isLogVisible = !this.isLogVisible;
      this.applyLogVisibility();
    });

    this.logFilter.addEventListener("input", (event) => {
      this.logFilterValue = event.target.value.trim().toLowerCase();
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

  openEditDialog({ mode, id, text, title, maxLength }) {
    if (!id) return;
    this.editingMode = mode;
    this.editingIdeaId = mode === "idea" ? id : null;
    this.editingProjectId = mode === "project" ? id : null;
    this.editTitle.textContent = title;
    this.editInput.value = text;
    this.editInput.maxLength = maxLength || 80;

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
        }
        if (mode === "project") {
          this.service.updateProjectName(id, nextText);
          this.animateProjectsOnNextRender = true;
        }
        this.render();
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
          <h3>${escapeHtml(project.name)}</h3>
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
      this.ideasList.innerHTML = "";
      this.ideasEmpty.style.display = "block";
      return;
    }

    this.ideaForm.classList.remove("hidden");
    this.activeProjectName.textContent = project.name;
    const stats = project.stats();
    this.progressFill.style.width = `${stats.percent}%`;
    this.progressLabel.textContent = `${stats.percent}%`;

    this.ideasList.innerHTML = "";

    const activeIdeas = project.ideas.filter((idea) => !idea.done);

    if (activeIdeas.length === 0) {
      this.ideasEmpty.style.display = "block";
      this.ideasEmpty.textContent = "Add an idea and keep the momentum going.";
      return;
    }

    this.ideasEmpty.style.display = "none";

    activeIdeas.forEach((idea, index) => {
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
      const toggleLabel = idea.done ? "Mark active" : "Mark complete";
      const toggleIcon = idea.done ? ICONS.checkCircle : ICONS.circle;
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
    const query = this.logFilterValue;
    const filteredEntries = query
      ? entries.filter(({ projectName, idea }) => {
          const haystack = `${projectName} ${idea.text}`.toLowerCase();
          return haystack.includes(query);
        })
      : entries;
    const visibleEntries = filteredEntries.slice(0, 10);

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
        <div class="log-actions">
          <button class="icon-button" type="button" data-action="reopen" aria-label="Reopen idea" title="Reopen idea">
            ${ICONS.reopen}
            <span class="sr-only">Reopen</span>
          </button>
        </div>
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
