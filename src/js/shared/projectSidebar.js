import { ApiTaskRepo } from "../adapters/outbound/storage/ApiTaskRepo.js";

function createProjectList(sidebar, id) {
  if (!sidebar) return null;

  const existingList = document.getElementById(id);
  if (existingList) return existingList;

  const navigationList = sidebar.querySelector("ul.nav.nav-pills");
  if (!navigationList) return null;

  const heading = document.createElement("div");
  heading.className = "text-secondary small mb-2 text-uppercase fw-bold mt-4";
  heading.style.fontSize = "0.75rem";
  heading.textContent = "Mis proyectos";

  const projectList = document.createElement("ul");
  projectList.className = "nav nav-pills flex-column mb-4 gap-1";
  projectList.id = id;

  navigationList.insertAdjacentElement("afterend", heading);
  heading.insertAdjacentElement("afterend", projectList);
  return projectList;
}

function renderProjects(projectList, projects) {
  if (!projectList) return;

  projectList.replaceChildren();
  if (projects.size === 0) {
    const emptyItem = document.createElement("li");
    const emptyMessage = document.createElement("span");
    emptyMessage.className = "nav-link text-muted py-1";
    const text = document.createElement("small");
    text.textContent = "No hay proyectos aún";
    emptyMessage.append(text);
    emptyItem.append(emptyMessage);
    projectList.append(emptyItem);
    return;
  }

  projects.forEach((count, name) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.className = "nav-link text-secondary py-1";

    const label = document.createElement("small");
    label.textContent = `• ${name}`;

    const taskCount = document.createElement("span");
    taskCount.className = "float-end";
    taskCount.textContent = String(count);

    label.append(taskCount);
    link.append(label);
    item.append(link);
    projectList.append(item);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const desktopSidebar = document.querySelector(
    ".sidebar-desktop, .profile-sidebar",
  );
  const mobileSidebar = document.querySelector(
    "#mobileSidebar .offcanvas-body",
  );
  const projectLists = [
    createProjectList(desktopSidebar, "sidebar-projects-list"),
    createProjectList(mobileSidebar, "mobile-sidebar-projects-list"),
  ].filter(Boolean);

  if (projectLists.length === 0) return;

  try {
    const tasks = await new ApiTaskRepo().findAll();
    const projects = new Map();
    tasks.forEach((task) => {
      const name = task.project || "General";
      projects.set(name, (projects.get(name) || 0) + 1);
    });

    projectLists.forEach((list) => renderProjects(list, projects));
  } catch (error) {
    console.error("No se pudieron cargar los proyectos de la barra lateral:", error);
  }
});
