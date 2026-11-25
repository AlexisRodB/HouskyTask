import { ApiTaskRepo } from "../../outbound/storage/ApiTaskRepo.js";
import { CreateTask } from "../../../core/use-cases/CreateTask.js";
import { hidePageLoader } from "../../../shared/pageLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const taskRepo = new ApiTaskRepo();
  const createTask = new CreateTask(taskRepo);
  const form = document.getElementById("task-form");
  const taskId = new URLSearchParams(window.location.search).get("id");
  let existingTask = null;

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
  const reminderSwitch = document.getElementById("reminder-switch");
  const reminderTime = document.getElementById("reminder-time");
  const reminderPreviewText = document.getElementById("reminder-preview-text");

  const previewTitle = document.getElementById("preview-title");
  const previewDesc = document.getElementById("preview-desc");
  const previewProject = document.getElementById("preview-project");
  const previewStatus = document.getElementById("preview-status-badge");
  const previewPriority = document.getElementById("preview-priority-badge");
  const previewDate = document.getElementById("preview-date");

  if (taskId) {
    document.title = "HouskyTask - Editar Tarea";
    document.getElementById("form-breadcrumb-title").textContent = "Editar tarea";
    document.getElementById("form-page-heading").textContent = "Edita tu tarea.";
    document.getElementById("form-page-description").textContent =
      "Actualiza los detalles y guarda los cambios.";
    document.getElementById("task-form-title").textContent = "Editar tarea";
    document.getElementById("task-cancel-link").href = "todasTareas.html";
    document.getElementById("task-submit-button").innerHTML =
      '<i class="bi bi-check2 me-1"></i> Guardar cambios';
    descInput.required = false;
    document.getElementById("task-description-required").hidden = true;
    document.getElementById("task-time-help").textContent =
      "Si dejas la hora vacía, se conservará la hora actual.";
  }

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
    const unchangedExistingDate =
      taskId && existingTask && dateInput.value === existingTask.dueDate;
    const isValid =
      !dateInput.value || dateInput.value >= today || unchangedExistingDate;
    dateInput.setCustomValidity(
      isValid ? "" : "La fecha de entrega debe ser hoy o una fecha futura.",
    );
    dateInput.classList.toggle("is-invalid", !isValid);
    return isValid;
  }

  function updatePreviewDate(date, time) {
    const calendarIcon = document.createElement("i");
    calendarIcon.className = "bi bi-calendar3 me-1";
    previewDate.replaceChildren(
      calendarIcon,
      document.createTextNode(
        ` ${date || "Sin fecha"}${time ? ` · ${time}` : ""}`,
      ),
    );
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
      updatePreviewDate(e.target.value, timeInput?.value);
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      updatePreviewDate(dateInput.value, timeInput.value);
    });
  }

  function getReminderText(minutes) {
    const selectedOption = reminderTime?.selectedOptions[0];
    if (selectedOption) return selectedOption.textContent;
    if (Number(minutes) === 1440) return "1 día antes";
    if (Number(minutes) === 60) return "1 hora antes";
    if (Number(minutes) === 120) return "2 horas antes";
    return `${minutes} min antes`;
  }

  function syncReminderControls() {
    if (!reminderSwitch || !reminderTime || !reminderPreviewText) return;

    reminderTime.disabled = !reminderSwitch.checked;
    reminderPreviewText.textContent = reminderSwitch.checked
      ? getReminderText(reminderTime.value)
      : "Recordatorio desactivado";
  }

  function populateForm(task) {
    titleInput.value = task.title ?? "";
    descInput.value = task.description ?? "";
    dateInput.value = task.dueDate ?? "";
    timeInput.value = task.time ? String(task.time).slice(0, 5) : "";

    const projectValue = String(task.project ?? "");
    const hasProjectOption = Array.from(projectSelect.options).some(
      (option) => option.value === projectValue,
    );
    if (projectValue && !hasProjectOption) {
      projectSelect.add(new Option(projectValue, projectValue));
    }
    projectSelect.value = projectValue;
    statusSelect.value = task.status ?? "";

    const priority = String(task.priority ?? "");
    priorityInput.value = priority;
    priorityBtns.forEach((button) => {
      button.classList.toggle(
        "active",
        button.getAttribute("data-priority") === priority,
      );
    });

    previewTitle.textContent = task.title || "Título de la tarea...";
    previewDesc.textContent = task.description || "Sin descripción detallada.";
    previewProject.textContent = projectValue.toUpperCase();
    previewStatus.textContent =
      statusSelect.selectedOptions[0]?.textContent || task.status || "";
    previewPriority.textContent = priority
      ? `Prioridad ${priority}`
      : "Prioridad sin seleccionar";
    updatePreviewDate(task.dueDate, timeInput.value);

    if (typeof task.reminderEnabled === "boolean") {
      reminderSwitch.checked = task.reminderEnabled;
    }
    if (task.reminderMinutes != null) {
      const minutes = String(task.reminderMinutes);
      const hasReminderOption = Array.from(reminderTime.options).some(
        (option) => option.value === minutes,
      );
      if (!hasReminderOption) {
        reminderTime.add(new Option(`${minutes} min antes`, minutes));
      }
      reminderTime.value = minutes;
    }
    syncReminderControls();
  }

  if (reminderSwitch) {
    reminderSwitch.addEventListener("change", syncReminderControls);
  }

  if (reminderTime) {
    reminderTime.addEventListener("change", syncReminderControls);
  }

  syncReminderControls();

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

  if (taskId) {
    try {
      existingTask = await taskRepo.findById(taskId);
    } catch (error) {
      console.error("Error al cargar la tarea para editar:", error);
      hidePageLoader();
      form.hidden = true;
      await window.Swal.fire({
        icon: "error",
        title: "No se pudo cargar la tarea",
        text: error.message || "Inténtalo nuevamente.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!existingTask) {
      hidePageLoader();
      form.hidden = true;
      await window.Swal.fire({
        icon: "error",
        title: "Tarea no disponible",
        text: "La tarea no existe o no está disponible.",
        confirmButtonText: "Entendido",
      });
      window.location.href = "todasTareas.html";
      return;
    }

    populateForm(existingTask);
  }

  // Guardar tarea al enviar formulario
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!titleInput.value.trim()) {
        titleInput.classList.add("is-invalid");
      }

      const isDescriptionProvided =
        Boolean(taskId) || Boolean(descInput.value.trim());
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
        time:
          timeInput?.value || (taskId ? existingTask.time || "" : ""),
        project: projectSelect.value,
        status: statusSelect.value,
        priority: priorityInput.value,
        reminderEnabled: Boolean(reminderSwitch?.checked),
        reminderMinutes: reminderSwitch?.checked ? Number(reminderTime.value) : null,
      };

      try {
        if (taskId) {
          await taskRepo.update({
            ...existingTask,
            ...newTask,
            id: taskId,
          });
        } else {
          await createTask.execute(newTask);
        }
        await window.Swal.fire({
          icon: "success",
          title: taskId
            ? "Tarea actualizada correctamente"
            : "Tarea creada correctamente",
          text: taskId
            ? "Los cambios se guardaron correctamente."
            : "La nueva tarea se ha guardado correctamente.",
          confirmButtonText: "Continuar",
          buttonsStyling: false,
          customClass: {
            popup: "housky-alert-popup",
            title: "housky-alert-title",
            confirmButton: "btn btn-primary-housky housky-alert-confirm",
          },
        });
        window.location.href = taskId ? "todasTareas.html" : "index.html";
      } catch (error) {
        console.error(
          taskId ? "Error al actualizar la tarea:" : "Error al guardar la tarea:",
          error,
        );
        await window.Swal.fire({
          icon: "error",
          title: taskId
            ? "No se pudo actualizar la tarea"
            : "No se pudo guardar la tarea",
          text: "Ocurrió un inconveniente. Inténtelo nuevamente.",
          confirmButtonText: "Entendido",
          buttonsStyling: false,
          customClass: {
            popup: "housky-alert-popup",
            title: "housky-alert-title",
            confirmButton: "btn btn-primary-housky housky-alert-confirm",
          },
        });
      }
    });
  }

  hidePageLoader();
});
