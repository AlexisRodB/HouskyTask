import { LocalStorageTaskRepo } from "../../outbound/storage/LocalStorageTaskRepo.js";

document.addEventListener("DOMContentLoaded", async () => {
  const taskRepo = new LocalStorageTaskRepo();
  const container = document.getElementById("tasks-list-container");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let currentFilter = "todos";
  let allTasks = [];

  async function loadAndRender() {
    allTasks = await taskRepo.findAll();
    renderTasks();
  }

  function renderTasks() {
    const filtered = allTasks.filter((t) => {
      if (currentFilter === "todos") return true;
      return t.status === currentFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card-housky text-center py-5">
          <i class="bi bi-inbox fs-1 text-secondary mb-3"></i>
          <h5 class="text-white fw-bold">No hay tareas encontradas</h5>
          <p class="text-secondary small mb-3">No existen tareas con este filtro actualmente.</p>
          <a href="agregarTarea.html" class="btn btn-primary-housky btn-sm">Crear tarea nueva</a>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (t) => `
      <div class="card-housky d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary text-dark" style="font-size: 0.65rem;">${t.project || "General"}</span>
            <span class="badge-priority-${t.priority}" style="font-size: 0.65rem;">${t.priority.toUpperCase()}</span>
            <span class="text-secondary small"><i class="bi bi-calendar-event me-1"></i>${t.dueDate || "Sin fecha"}</span>
          </div>
          <h5 class="fw-bold text-white mb-1 ${t.status === "completada" ? "text-decoration-line-through text-muted" : ""}">${t.title}</h5>
          <p class="text-secondary small mb-0">${t.description || "Sin descripción"}</p>
        </div>

        <div class="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-end">
          <select class="form-select form-select-sm bg-dark text-white border-secondary status-select" data-id="${t.id}" style="width: 130px;">
            <option value="pendiente" ${t.status === "pendiente" ? "selected" : ""}>Pendiente</option>
            <option value="en-curso" ${t.status === "en-curso" ? "selected" : ""}>En curso</option>
            <option value="completada" ${t.status === "completada" ? "selected" : ""}>Completada</option>
          </select>

          <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${t.id}" title="Eliminar tarea">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("");

    attachEventListeners();
  }

  function attachEventListeners() {
    // Cambio de estado directo desde el selector
    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-id");
        const newStatus = e.target.value;

        const task = await taskRepo.findById(id);
        if (task) {
          task.status = newStatus;
          await taskRepo.save(task);
          loadAndRender(); // Refrescar vista
        }
      });
    });

    // Eliminar tarea
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
          await taskRepo.delete(id);
          loadAndRender(); // Refrescar vista
        }
      });
    });
  }

  // Manejo de botones de filtro
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach((b) =>
        b.classList.remove("active", "btn-primary-housky"),
      );
      filterButtons.forEach((b) => b.classList.add("btn-outline-secondary"));

      e.currentTarget.classList.add("active", "btn-primary-housky");
      e.currentTarget.classList.remove("btn-outline-secondary");

      currentFilter = e.currentTarget.getAttribute("data-filter");
      renderTasks();
    });
  });

  // Carga inicial
  loadAndRender();
});
