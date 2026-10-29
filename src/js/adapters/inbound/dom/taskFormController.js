import { LocalStorageTaskRepo } from "../../outbound/storage/LocalStorageTaskRepo.js";
import { CreateTask } from "../../../core/use-cases/CreateTask.js";

document.addEventListener("DOMContentLoaded", () => {
  const taskRepo = new LocalStorageTaskRepo();
  const createTask = new CreateTask(taskRepo);
  const form = document.getElementById("task-form");

  // Elementos de la vista previa en vivo
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-description");
  const dateInput = document.getElementById("task-duedate");
  const timeInput = document.getElementById("task-time");
  const projectSelect = document.getElementById("task-project");
  const statusSelect = document.getElementById("task-status");
  const priorityInput = document.getElementById("task-priority");
  const priorityBtns = document.querySelectorAll(".priority-pill");

  const previewTitle = document.getElementById("preview-title");
  const previewDesc = document.getElementById("preview-desc");
  const previewProject = document.getElementById("preview-project");
  const previewStatus = document.getElementById("preview-status-badge");
  const previewPriority = document.getElementById("preview-priority-badge");
  const previewDate = document.getElementById("preview-date");

  // Sincronización en vivo
  if (titleInput) {
    titleInput.addEventListener("input", (e) => {
      previewTitle.textContent = e.target.value || "Título de la tarea...";
    });
  }

  if (descInput) {
    descInput.addEventListener("input", (e) => {
      previewDesc.textContent = e.target.value || "Sin descripción detallada.";
    });
  }

  if (projectSelect) {
    projectSelect.addEventListener("change", (e) => {
      previewProject.textContent = e.target.value.toUpperCase();
      projectSelect.classList.remove("is-invalid");
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      previewStatus.textContent = e.target.options[e.target.selectedIndex].text;
      statusSelect.classList.remove("is-invalid");
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", (e) => {
      if (e.target.value) {
        previewDate.innerHTML = `<i class="bi bi-calendar3 me-1"></i> ${e.target.value} · ${timeInput?.value || ""}`;
      }
    });
  }

  // Manejo de botones de prioridad (Pills)
  priorityBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      priorityBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.getAttribute("data-priority");
      if (priorityInput) priorityInput.value = val;
      if (previewPriority) previewPriority.textContent = `Prioridad ${val}`;
    });
  });

  // Guardar tarea al enviar formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!titleInput.value.trim()) {
        titleInput.classList.add("is-invalid");
      }

      const isProjectSelected = Boolean(projectSelect.value);
      const isStatusSelected = Boolean(statusSelect.value);
      projectSelect.classList.toggle("is-invalid", !isProjectSelected);
      statusSelect.classList.toggle("is-invalid", !isStatusSelected);

      if (!titleInput.value.trim() || !isProjectSelected || !isStatusSelected) {
        return;
      }

      const newTask = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        dueDate: dateInput.value || new Date().toISOString().split("T")[0],
        time: timeInput?.value || "10:00",
        project: projectSelect.value,
        status: statusSelect.value,
        priority: priorityInput.value,
      };

      try {
        await createTask.execute(newTask);
        alert("¡Tarea creada con éxito, mi rey!");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error al guardar la tarea:", error);
        alert("Hubo un error al guardar la tarea.");
      }
    });
  }
});
