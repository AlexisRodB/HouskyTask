import { ApiTaskRepo } from "../../outbound/storage/ApiTaskRepo.js";
import { hidePageLoader } from "../../../shared/pageLoader.js";
import {
  getDeadlineMessage,
  getDaysUntilDueDate,
  getTasksDueWithinRange,
} from "../../../shared/taskDates.js";

document.addEventListener("DOMContentLoaded", async () => {
  const taskRepo = new ApiTaskRepo();

  try {
    const tasks = await taskRepo.findAll();
    const today = new Date();
    const visibleTasks = getTasksDueWithinRange(tasks, today);

    // calcular metricas pendientes, en curso y completadas
    const pendingCount = tasks.filter((t) => t.status === "pendiente").length;
    const inProgressCount = tasks.filter((t) => t.status === "en-curso").length;
    const completedCount = tasks.filter(
      (t) => t.status === "completada",
    ).length;
    const totalCount = tasks.length;

    // Actualizar elementos
    const metricPending = document.getElementById("metric-pending-count");
    const metricInProg = document.getElementById("metric-inprogress-count");
    const metricComp = document.getElementById("metric-completed-count");

    if (metricPending)
      metricPending.textContent = String(pendingCount).padStart(2, "0");
    if (metricInProg)
      metricInProg.textContent = String(inProgressCount).padStart(2, "0");
    if (metricComp)
      metricComp.textContent = String(completedCount).padStart(2, "0");

    // actualizar texto de bienvenida superior
    const welcomeSummary = document.getElementById("welcome-summary");
    if (welcomeSummary) {
      const currentUser = JSON.parse(
        localStorage.getItem("houskytask_user") || "{}",
      );
      const firstName = currentUser.fullName?.trim().split(/\s+/)[0] || "Usuario";
      welcomeSummary.textContent = `Hola, ${firstName}. Tienes ${pendingCount + inProgressCount} entregas pendientes. Hagamos espacio para avanzar.`;
    }

    // proyectos sidebar
    const projectsMap = {};
    tasks.forEach((t) => {
      const proj = t.project || "General";
      projectsMap[proj] = (projectsMap[proj] || 0) + 1;
    });

    const sidebarProjectsList = document.getElementById(
      "sidebar-projects-list",
    );
    const mobileSidebarProjectsList = document.getElementById(
      "mobile-sidebar-projects-list",
    );

    const projectsHTML =
      Object.keys(projectsMap).length > 0
        ? Object.keys(projectsMap)
            .map(
              (name) => `
          <li><a href="#" class="nav-link text-secondary py-1"><small>• ${name} <span class="float-end">${projectsMap[name]}</span></small></a></li>
        `,
            )
            .join("")
        : '<li><span class="nav-link text-muted py-1"><small>No hay proyectos aún</small></span></li>';

    if (sidebarProjectsList) sidebarProjectsList.innerHTML = projectsHTML;
    if (mobileSidebarProjectsList)
      mobileSidebarProjectsList.innerHTML = projectsHTML;

    // contador proyectos perfil
    const profileProjectsCount = document.getElementById(
      "profile-card-projects-count",
    );
    if (profileProjectsCount) {
      const uniqueProjectsLength = Object.keys(projectsMap).length;
      profileProjectsCount.textContent = `${uniqueProjectsLength} proyecto${uniqueProjectsLength === 1 ? "" : "s"}`;
    }

    // cargar foco de hoy
    const todayFocusCard = document.getElementById("today-focus-card");
    const todayFocus =
      visibleTasks.find(
        (t) => t.status === "en-curso" || t.status === "pendiente",
      ) || visibleTasks[0];

    if (todayFocusCard) {
      if (todayFocus) {
        todayFocusCard.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;"><i class="bi bi-bullseye text-warning me-1"></i> Tu foco de hoy</span>
            <small class="text-secondary">${todayFocus.dueDate || "Sin fecha"}</small>
          </div>
          <h5 class="fw-bold text-white mb-2">${todayFocus.title}</h5>
          <p class="text-secondary small mb-3">${todayFocus.description || "Sin descripción adicional. ¡A darle con todo!"}</p>
          
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge-priority-${todayFocus.priority}">${todayFocus.priority.toUpperCase()} prioridad</span>
            <small class="text-secondary">${todayFocus.status}</small>
          </div>

          <button class="btn btn-primary-housky w-100 py-2 d-flex align-items-center justify-content-center gap-2">
            <i class="bi bi-arrow-right-circle"></i> Continuar tarea
          </button>
        `;
      } else {
        todayFocusCard.innerHTML = `
          <div class="text-center py-4">
            <i class="bi bi-check2-all fs-1 text-success mb-2"></i>
            <h6 class="text-white fw-bold">Sin tareas en este rango</h6>
            <p class="text-secondary small mb-3">Aquí aparecen las tareas vencidas de los últimos 7 días y las entregas de los próximos 7.</p>
            <a href="agregarTarea.html" class="btn btn-primary-housky btn-sm w-100">Crear nueva tarea</a>
          </div>
        `;
      }
    }

    // RENDERIZAR PRÓXIMOS 7 DÍAS
    const upcomingContainer = document.getElementById(
      "upcoming-tasks-container",
    );
    const upcomingTasks = visibleTasks.filter(
      (task) => getDaysUntilDueDate(task.dueDate, today) >= 0,
    );
    const overdueTasks = visibleTasks
      .filter(
        (task) => getDaysUntilDueDate(task.dueDate, today) < 0,
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (upcomingContainer) {
      const overdueHTML =
        overdueTasks.length > 0
          ? `
          <div class="mb-2">
            <h6 class="text-danger fw-bold small mb-2">Entregas vencidas</h6>
            <div class="d-flex flex-column gap-2">
              ${overdueTasks
                .map(
                  (task) => `
                <div class="p-2 rounded bg-dark border border-danger d-flex justify-content-between align-items-center gap-2">
                  <div>
                    <div class="text-white fw-bold small">${task.title}</div>
                    <small class="text-danger">${getDeadlineMessage(task.dueDate, today)}</small>
                  </div>
                  <span class="badge-priority-${task.priority}" style="font-size: 0.55rem;">${task.priority}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `
          : "";

      const upcomingHTML =
        upcomingTasks.length === 0
          ? `
          <div class="text-center py-4 px-3 rounded bg-dark border border-secondary bg-opacity-25">
            <i class="bi bi-calendar-check text-secondary fs-2 mb-2"></i>
            <h6 class="text-white fw-bold mb-1">No hay entregas en los próximos 7 días</h6>
            <p class="text-secondary small mb-3">Las entregas futuras dentro de este plazo aparecerán aquí.</p>
            <a href="agregarTarea.html" class="btn btn-sm btn-primary-housky">Agregar nueva tarea</a>
          </div>
        `
          : `
          <div class="d-flex flex-column gap-2">
            ${upcomingTasks
              .map(
                (task) => `
              <div class="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center gap-2">
                <div>
                  <div class="text-white fw-bold small mb-0">${task.title}</div>
                  <small class="text-secondary" style="font-size: 0.7rem;">${task.dueDate} · ${task.project || "General"}</small>
                  <small class="d-block text-warning">${getDeadlineMessage(task.dueDate, today)}</small>
                </div>
                <span class="badge-priority-${task.priority}" style="font-size: 0.55rem;">${task.priority}</span>
              </div>
            `,
            )
            .join("")}
          </div>
        `;

      upcomingContainer.innerHTML = `${overdueHTML}${upcomingHTML}`;
    }
  } catch (error) {
    console.error("Error al inicializar el controlador de inicio:", error);
  } finally {
    hidePageLoader();
  }
});
