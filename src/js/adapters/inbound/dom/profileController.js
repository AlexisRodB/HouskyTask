import { LocalStorageTaskRepo } from "../../outbound/storage/LocalStorageTaskRepo.js";

document.addEventListener("DOMContentLoaded", async () => {
  const taskRepo = new LocalStorageTaskRepo();

  // 1. Estadísticas de tareas
  const totalTasksEl = document.getElementById("profile-total-tasks");
  const completedTasksEl = document.getElementById("profile-completed-tasks");
  const pendingTasksEl = document.getElementById("profile-pending-tasks");

  try {
    const tasks = await taskRepo.findAll();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completada").length;
    const pending = total - completed;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
  } catch (error) {
    console.error("Error al cargar métricas:", error);
  }

  // 2. Gestión de Edición de Perfil con LocalStorage
  const profileForm = document.getElementById("edit-profile-form");
  const nameDisplay = document.getElementById("profile-name-display");
  const bioDisplay = document.getElementById("profile-bio-text");
  const contactEmail = document.getElementById("contact-email");
  const contactPhone = document.getElementById("contact-phone");

  // Cargar datos guardados previamente si existen
  const savedProfile = JSON.parse(localStorage.getItem("houskytask_profile"));
  if (savedProfile) {
    if (nameDisplay && savedProfile.name)
      nameDisplay.textContent = savedProfile.name;
    if (bioDisplay && savedProfile.bio)
      bioDisplay.textContent = savedProfile.bio;
    if (contactEmail && savedProfile.email) {
      contactEmail.textContent = savedProfile.email;
      contactEmail.href = `mailto:${savedProfile.email}`;
    }
    if (contactPhone && savedProfile.phone)
      contactPhone.textContent = savedProfile.phone;

    // Rellenar inputs del modal
    document.getElementById("input-name").value = savedProfile.name || "";
    document.getElementById("input-email").value = savedProfile.email || "";
    document.getElementById("input-phone").value = savedProfile.phone || "";
    document.getElementById("input-bio").value = savedProfile.bio || "";
  }

  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const updatedData = {
        name: document.getElementById("input-name").value,
        email: document.getElementById("input-email").value,
        phone: document.getElementById("input-phone").value,
        bio: document.getElementById("input-bio").value,
      };

      localStorage.setItem("houskytask_profile", JSON.stringify(updatedData));

      // Actualizar vista al instante
      if (nameDisplay) nameDisplay.textContent = updatedData.name;
      if (bioDisplay) bioDisplay.textContent = updatedData.bio;
      if (contactEmail) {
        contactEmail.textContent = updatedData.email;
        contactEmail.href = `mailto:${updatedData.email}`;
      }
      if (contactPhone) contactPhone.textContent = updatedData.phone;

      // Cerrar modal usando Bootstrap
      const modalEl = document.getElementById("editProfileModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      alert("¡Perfil actualizado con éxito, mi rey!");
    });
  }
});
