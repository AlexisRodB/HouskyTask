import { LocalStorageTaskRepo } from "../../outbound/storage/LocalStorageTaskRepo.js";

document.addEventListener("DOMContentLoaded", async () => {
  const taskRepo = new LocalStorageTaskRepo();

  try {
    // obtener todas las tareas almacenadas
    const tasks = await taskRepo.findAll();

    // calcular metricas pendientes, en curso y completadas
    const pendingCount = tasks.filter((t) => t.status === "pendiente").length;
    const inProgressCount = tasks.filter((t) => t.status === "en-curso").length;
    const completedCount = tasks.filter(
      (t) => t.status === "completada",
    ).length;
    const totalCount = tasks.length;

    // Actualizar elementos en el DOM de métricas
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
      welcomeSummary.textContent = `Hola, Alexis. Tienes ${pendingCount + inProgressCount} entregas pendientes. Hagamos espacio para avanzar.`;
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
      profileProjectsCount.textContent = `${uniqueProjectsLength} proyecto${uniqueProjectsLength === 1 ? "" : "s"} · CV actualizado`;
    }

    // cargar foco de hoy
    const todayFocusCard = document.getElementById("today-focus-card");
    const todayFocus =
      tasks.find((t) => t.status === "en-curso" || t.status === "pendiente") ||
      tasks[0];

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
            <h6 class="text-white fw-bold">¡Todo al día!</h6>
            <p class="text-secondary small mb-3">No tienes tareas pendientes por ahora.</p>
            <a href="agregarTarea.html" class="btn btn-primary-housky btn-sm w-100">Crear nueva tarea</a>
          </div>
        `;
      }
    }

    // ==========================================
    // RENDERIZAR PRÓXIMOS 7 DÍAS (CON ESTADO VACÍO)
    // ==========================================
    const upcomingContainer = document.getElementById(
      "upcoming-tasks-container",
    );
    const upcomingTasks = tasks.filter((t) => t.status !== "completada");

    if (upcomingContainer) {
      if (upcomingTasks.length === 0) {
        upcomingContainer.innerHTML = `
          <div class="text-center py-4 px-3 rounded bg-dark border border-secondary bg-opacity-25">
            <i class="bi bi-check2-circle text-warning fs-2 mb-2"></i>
            <h6 class="text-white fw-bold mb-1">¡Todo al día por aquí!</h6>
            <p class="text-secondary small mb-3">No tienes tareas pendientes. Disfruta tu tiempo libre o agrega un nuevo plan cuando estés listo.</p>
            <a href="agregarTarea.html" class="btn btn-sm btn-primary-housky">Agregar nueva tarea</a>
          </div>
        `;
      } else {
        upcomingContainer.innerHTML = `
          <div class="d-flex flex-column gap-2">
            ${upcomingTasks
              .slice(0, 3)
              .map(
                (t) => `
              <div class="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-white fw-bold small mb-0">${t.title}</div>
                  <small class="text-secondary" style="font-size: 0.7rem;">${t.dueDate || "Sin fecha límite"} · ${t.project || "General"}</small>
                </div>
                <span class="badge-priority-${t.priority}" style="font-size: 0.55rem;">${t.priority}</span>
              </div>
            `,
            )
            .join("")}
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Error al inicializar el controlador de inicio:", error);
  }
});
