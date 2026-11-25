import { ApiTaskRepo } from "../../outbound/storage/ApiTaskRepo.js";
import { CreateTask } from "../../../core/use-cases/CreateTask.js";
import { hidePageLoader } from "../../../shared/pageLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const taskRepo = new ApiTaskRepo();
  const createTask = new CreateTask(taskRepo);
  const form = document.getElementById("task-form");

  // Elementos de la vista previa
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-description");
  const dateInput = document.getElementById("task-duedate");
  const timeInput = document.getElementById("task-time");
  const projectSelect = document.getElementById("task-project");
  const statusSelect = document.getElementById("task-status");
  const priorityInput = document.getElementById("task-priority");
  const priorityGroup = document.getElementById("priority-group");
  const priorityFeedback = document.getElementById("priority-feedback");
  const priorityBtns = document.querySelectorAll(".priority-pill");

  const previewTitle = document.getElementById("preview-title");
  const previewDesc = document.getElementById("preview-desc");
  const previewProject = document.getElementById("preview-project");
  const previewStatus = document.getElementById("preview-status-badge");
  const previewPriority = document.getElementById("preview-priority-badge");
  const previewDate = document.getElementById("preview-date");

  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function validateDueDate() {
    if (!dateInput) return true;

    const today = getLocalDateString();
    dateInput.min = today;
    const isValid = !dateInput.value || dateInput.value >= today;
    dateInput.setCustomValidity(
      isValid ? "" : "La fecha de entrega debe ser hoy o una fecha futura.",
    );
    dateInput.classList.toggle("is-invalid", !isValid);
    return isValid;
  }

  if (dateInput) {
    dateInput.min = getLocalDateString();
  }

  // Sincronización en vivo
  if (titleInput) {
    titleInput.addEventListener("input", (e) => {
      previewTitle.textContent = e.target.value || "Título de la tarea...";
    });
  }

  if (descInput) {
    descInput.addEventListener("input", (e) => {
      previewDesc.textContent = e.target.value || "Sin descripción detallada.";
      descInput.classList.remove("is-invalid");
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
      validateDueDate();
      if (e.target.value) {
        const timeText = timeInput?.value ? ` · ${timeInput.value}` : "";
        previewDate.innerHTML = `<i class="bi bi-calendar3 me-1"></i> ${e.target.value}${timeText}`;
      }
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      if (dateInput.value) {
        const timeText = timeInput.value ? ` · ${timeInput.value}` : "";
        previewDate.innerHTML = `<i class="bi bi-calendar3 me-1"></i> ${dateInput.value}${timeText}`;
      }
    });
  }

  // Manejo de botones de prioridad
  priorityBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      priorityBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const val = btn.getAttribute("data-priority");
      if (priorityInput) priorityInput.value = val;
      if (previewPriority) previewPriority.textContent = `Prioridad ${val}`;
      priorityGroup.classList.remove("is-invalid");
      priorityFeedback.classList.remove("d-block");
    });
  });

  // Guardar tarea al enviar formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!titleInput.value.trim()) {
        titleInput.classList.add("is-invalid");
      }

      const isDescriptionProvided = Boolean(descInput.value.trim());
      const isProjectSelected = Boolean(projectSelect.value);
      const isStatusSelected = Boolean(statusSelect.value);
      const isPrioritySelected = Boolean(priorityInput.value);
      const isDueDateValid = validateDueDate();
      descInput.classList.toggle("is-invalid", !isDescriptionProvided);
      projectSelect.classList.toggle("is-invalid", !isProjectSelected);
      statusSelect.classList.toggle("is-invalid", !isStatusSelected);
      priorityGroup.classList.toggle("is-invalid", !isPrioritySelected);
      priorityFeedback.classList.toggle("d-block", !isPrioritySelected);
      if (!isDueDateValid) dateInput.reportValidity();

      if (
        !titleInput.value.trim() ||
        !isDescriptionProvided ||
        !isProjectSelected ||
        !isStatusSelected ||
        !isPrioritySelected ||
        !isDueDateValid
      ) {
        return;
      }

      const newTask = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        dueDate: dateInput.value || getLocalDateString(),
        time: timeInput?.value || "",
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

  hidePageLoader();
});
