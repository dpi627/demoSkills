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
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

    this.clearFinishedDates();
    this.repository.save(this.projects);
  }

  getProjects() {
    return this.projects;
  }

  getFinishedLog() {
    const entries = [];
    this.projects.forEach((project) => {
      project.ideas.forEach((idea) => {
        if (idea.done && idea.finishedAt) {
          entries.push({ projectName: project.name, idea });
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

  addIdea(projectId, text) {
    const project = this.findProject(projectId);
    project.ideas.push(new Idea({ text: text.trim() }));
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
    const idea = this.findIdea(projectId, ideaId);
    idea.done = !idea.done;
    idea.finishedAt = idea.done ? new Date().toISOString() : null;
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

  clearFinishedDates() {
    this.projects.forEach((project) => {
      project.ideas.forEach((idea) => {
        idea.finishedAt = null;
      });
    });
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
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (event) => this.handleMove(event.clientX, event.clientY));
    window.addEventListener("mouseleave", () => {
      this.pointer.active = false;
    });
    window.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      this.handleMove(touch.clientX, touch.clientY);
    });
    window.addEventListener("touchend", () => {
      this.pointer.active = false;
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
    this.pointer.active = now - this.pointer.lastMove < 1200;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updatePoints(now);
    this.drawNetwork();
    requestAnimationFrame(this.animate);
  }

  updatePoints(now) {
    const pullStrength = this.pointer.active ? 0.0016 : 0;
    this.points.forEach((point) => {
      point.vx += Math.sin(now / 1200 + point.phase) * 0.02;
      point.vy += Math.cos(now / 1100 + point.phase) * 0.02;

      if (pullStrength) {
        const dx = this.pointer.x - point.x;
        const dy = this.pointer.y - point.y;
        point.vx += dx * pullStrength;
        point.vy += dy * pullStrength;
      }

      point.vx *= 0.98;
      point.vy *= 0.98;
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > this.width) point.vx *= -1;
      if (point.y < 0 || point.y > this.height) point.vy *= -1;
    });
  }

  drawNetwork() {
    const maxDistance = 140;
    for (let i = 0; i < this.points.length; i += 1) {
      for (let j = i + 1; j < this.points.length; j += 1) {
        const dx = this.points[i].x - this.points[j].x;
        const dy = this.points[i].y - this.points[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.3;
          this.ctx.strokeStyle = `${this.palette.line}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[i].x, this.points[i].y);
          this.ctx.lineTo(this.points[j].x, this.points[j].y);
          this.ctx.stroke();
        }
      }
    }
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

    this.ideaForm = document.getElementById("ideaForm");
    this.ideaTextInput = document.getElementById("ideaText");
    this.ideasList = document.getElementById("ideasList");
    this.ideasEmpty = document.getElementById("ideasEmpty");
    this.logList = document.getElementById("logList");
    this.logEmpty = document.getElementById("logEmpty");
    this.editDialog = document.getElementById("editDialog");
    this.editForm = document.getElementById("editForm");
    this.editInput = document.getElementById("editInput");
    this.editCancel = document.getElementById("editCancel");
    this.editingIdeaId = null;

    const initialTheme = this.themeService.init();
    this.updateThemeLabel(initialTheme);
    this.background.updatePalette();

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = this.projectNameInput.value.trim();
      if (!name) return;
      const project = this.service.createProject(name);
      this.projectNameInput.value = "";
      this.activeProjectId = project.id;
      this.render();
    });

    this.projectsList.addEventListener("click", (event) => {
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
      this.ideaTextInput.value = "";
      this.render();
    });

    this.ideasList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || !this.activeProjectId) return;
      const ideaId = button.closest("li")?.dataset.id;
      if (!ideaId) return;
      const action = button.dataset.action;

      if (action === "up") {
        this.service.moveIdea(this.activeProjectId, ideaId, -1);
      }
      if (action === "down") {
        this.service.moveIdea(this.activeProjectId, ideaId, 1);
      }
      if (action === "edit") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
        this.openEditDialog(idea);
        return;
      }
      if (action === "delete") {
        const idea = this.service.findIdea(this.activeProjectId, ideaId);
        const ok = window.confirm(`Delete \"${idea.text}\"?`);
        if (!ok) return;
        this.service.deleteIdea(this.activeProjectId, ideaId);
      }

      this.render();
    });

    this.ideasList.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[type='checkbox']");
      if (!checkbox || !this.activeProjectId) return;
      const ideaId = checkbox.closest("li")?.dataset.id;
      if (!ideaId) return;
      this.service.toggleIdea(this.activeProjectId, ideaId);
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

    this.editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = this.editInput.value.trim();
      if (!text || !this.activeProjectId || !this.editingIdeaId) {
        this.closeEditDialog();
        return;
      }
      this.service.updateIdeaText(this.activeProjectId, this.editingIdeaId, text);
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
  }

  updateThemeLabel(theme) {
    this.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }

  openEditDialog(idea) {
    if (!idea) return;
    this.editingIdeaId = idea.id;
    this.editInput.value = idea.text;

    if (typeof this.editDialog.showModal === "function") {
      this.editDialog.showModal();
      this.editInput.focus();
      this.editInput.select();
    } else {
      const nextText = window.prompt("Edit idea", idea.text);
      if (nextText !== null && nextText.trim()) {
        this.service.updateIdeaText(this.activeProjectId, idea.id, nextText);
        this.render();
      }
    }
  }

  closeEditDialog() {
    if (this.editDialog.open) {
      this.editDialog.close();
    }
    this.editingIdeaId = null;
  }

  render() {
    this.renderProjects();
    this.renderIdeas();
    this.renderLog();
  }

  renderProjects() {
    const projects = this.service.getProjects();
    this.projectsList.innerHTML = "";

    if (projects.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Create your first project to get started.";
      this.projectsList.appendChild(empty);
      return;
    }

    projects.forEach((project) => {
      const stats = project.stats();
      const card = document.createElement("div");
      card.className = "project-card";
      card.draggable = true;
      if (project.id === this.activeProjectId) {
        card.classList.add("active");
      }
      card.dataset.id = project.id;
      card.innerHTML = `
        <h3>${escapeHtml(project.name)}</h3>
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

    if (project.ideas.length === 0) {
      this.ideasEmpty.style.display = "block";
      this.ideasEmpty.textContent = "Add an idea and keep the momentum going.";
      return;
    }

    this.ideasEmpty.style.display = "none";

    project.ideas.forEach((idea, index) => {
      const item = document.createElement("li");
      item.className = "idea-item";
      item.draggable = true;
      if (idea.done) item.classList.add("completed");
      item.dataset.id = idea.id;
      const finishedLabel = idea.done && idea.finishedAt ? formatDate(idea.finishedAt) : "";
      const createdLabel = formatDate(idea.createdAt);
      item.innerHTML = `
        <input type="checkbox" ${idea.done ? "checked" : ""} />
        <span class="idea-text">
          <span class="idea-title">${escapeHtml(idea.text)}</span>
          <small>Created ${createdLabel}</small>
          ${finishedLabel ? `<small>Finished ${finishedLabel}</small>` : ""}
        </span>
        <div class="idea-actions">
          <button class="icon-button" data-action="up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="icon-button" data-action="down" ${index === project.ideas.length - 1 ? "disabled" : ""}>↓</button>
          <button class="icon-button" data-action="edit">Edit</button>
          <button class="icon-button" data-action="delete">Delete</button>
        </div>
      `;
      this.ideasList.appendChild(item);
    });
  }

  renderLog() {
    const entries = this.service.getFinishedLog();
    this.logList.innerHTML = "";

    if (entries.length === 0) {
      this.logEmpty.style.display = "block";
      return;
    }

    this.logEmpty.style.display = "none";
    entries.forEach(({ projectName, idea }) => {
      const item = document.createElement("li");
      item.className = "log-item";
      item.innerHTML = `
        <span>${escapeHtml(idea.text)}</span>
        <small>${escapeHtml(projectName)} · Finished ${formatDate(idea.finishedAt)}</small>
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
