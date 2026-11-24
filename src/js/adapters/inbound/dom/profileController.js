import { ApiTaskRepo } from "../../outbound/storage/ApiTaskRepo.js";
import { authFetch } from "../../outbound/storage/authFetch.js";
import { API_BASE_URL } from "../../../shared/constants.js";
import { hidePageLoader } from "../../../shared/pageLoader.js";

const SESSION_KEY = "houskytask_user";
const SOCIAL_LINKS = [
  { key: "github", label: "GitHub", icon: "bi-github" },
  { key: "linkedin", label: "LinkedIn", icon: "bi-linkedin" },
  { key: "instagram", label: "Instagram", icon: "bi-instagram" },
  { key: "twitter", label: "X / Twitter", icon: "bi-twitter-x" },
];

function readCurrentUser() {
  const rawUser = localStorage.getItem(SESSION_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("No se pudo leer el perfil de la sesión:", error);
    return null;
  }
}

function getInitials(fullName) {
  return (fullName || "Usuario")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function setAvatar(avatar, avatarUrl, fullName) {
  const initials = avatar.querySelector(".user-initials-display");
  const image = avatar.querySelector(".user-avatar-image");

  if (initials) {
    initials.textContent = getInitials(fullName);
    initials.hidden = false;
  }

  if (!image) return;

  const source = avatarUrl?.trim();
  if (!source || !/^(https?:\/\/|data:image\/)/i.test(source)) {
    image.removeAttribute("src");
    image.hidden = true;
    return;
  }

  image.onload = () => {
    image.hidden = false;
    if (initials) initials.hidden = true;
  };
  image.onerror = () => {
    image.hidden = true;
    if (initials) initials.hidden = false;
  };
  image.src = source;
}

function renderSocialLinks(user) {
  const linksContainer = document.getElementById("profile-social-links");
  const emptyMessage = document.getElementById("profile-socials-empty");
  if (!linksContainer || !emptyMessage) return;

  linksContainer.replaceChildren();

  SOCIAL_LINKS.forEach(({ key, label, icon }) => {
    const rawUrl = user.socials?.[key]?.trim();
    if (!rawUrl) return;

    const candidate = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`;
    let url;
    try {
      url = new URL(candidate);
    } catch (error) {
      console.warn(`Se omitió una URL inválida para ${label}.`, error);
      return;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    const link = document.createElement("a");
    link.className = "profile-social-link";
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i><span>${label}</span>`;
    linksContainer.append(link);
  });

  emptyMessage.hidden = linksContainer.childElementCount > 0;
}

function renderUser(user) {
  const fullName = user.fullName?.trim() || "Usuario";

  document.querySelectorAll(".user-fullname-display").forEach((element) => {
    element.textContent = fullName;
  });
  document.querySelectorAll(".user-initials-display").forEach((element) => {
    element.textContent = getInitials(fullName);
    element.hidden = false;
  });
  document.querySelectorAll(".user-email-display").forEach((element) => {
    element.textContent = user.email || "Sin correo registrado";
  });
  document.querySelectorAll(".user-avatar").forEach((avatar) => {
    setAvatar(avatar, user.avatarUrl, fullName);
  });

  const bio = document.getElementById("profile-bio-display");
  if (bio) bio.textContent = user.bio?.trim() || "Aún no agregas una descripción.";

  const phone = document.getElementById("profile-phone-display");
  if (phone) phone.textContent = user.phone?.trim() || "No configurado";

  renderSocialLinks(user);
}

function populateForm(user, elements) {
  elements.name.value = user.fullName || "";
  elements.email.value = user.email || "";
  elements.bio.value = user.bio || "";
  elements.phone.value = user.phone || "";
  elements.avatarUrl.value = user.avatarUrl?.startsWith("data:image/")
    ? ""
    : user.avatarUrl || "";
  elements.avatarValue.value = user.avatarUrl || "";
  elements.avatarFile.value = "";

  SOCIAL_LINKS.forEach(({ key }) => {
    elements.socials[key].value = user.socials?.[key] || "";
  });

  elements.error.hidden = true;
  setAvatar(
    elements.avatarPreview,
    user.avatarUrl,
    user.fullName,
  );
}

function updateTaskMetrics() {
  const errorMessage = document.getElementById("profile-tasks-error");

  return new ApiTaskRepo()
    .findAll()
    .then((tasks) => {
      const completed = tasks.filter(
        (task) => task.status === "completada",
      ).length;
      const total = tasks.length;
      const pending = total - completed;
      const completionRate = total
        ? Math.round((completed / total) * 100)
        : 0;

      document.getElementById("stat-total-tasks").textContent = total;
      document.getElementById("stat-completed-tasks").textContent = completed;
      document.getElementById("stat-pending-tasks").textContent = pending;
      document.getElementById("stat-completion-rate").textContent =
        `${completionRate}%`;
      if (errorMessage) errorMessage.hidden = true;
    })
    .catch((error) => {
      console.error("Error al cargar las tareas del perfil:", error);
      if (errorMessage) {
        errorMessage.textContent =
          "No se pudo cargar el resumen de tareas. Inténtalo de nuevo más tarde.";
        errorMessage.hidden = false;
      }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = readCurrentUser();
  if (!user) {
    hidePageLoader();
    return;
  }

  const elements = {
    form: document.getElementById("edit-profile-form"),
    name: document.getElementById("input-name"),
    email: document.getElementById("input-email"),
    bio: document.getElementById("input-bio"),
    phone: document.getElementById("input-phone"),
    avatarFile: document.getElementById("input-avatar-file"),
    avatarUrl: document.getElementById("input-avatar-url"),
    avatarValue: document.getElementById("input-avatar-value"),
    avatarPreview: document.getElementById("avatar-preview"),
    error: document.getElementById("profile-form-error"),
    socials: Object.fromEntries(
      SOCIAL_LINKS.map(({ key }) => [
        key,
        document.getElementById(`input-${key}`),
      ]),
    ),
  };

  renderUser(user);
  const taskMetricsRequest = updateTaskMetrics();

  document
    .getElementById("edit-profile-button")
    .addEventListener("click", () => populateForm(user, elements));

  elements.avatarFile.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      elements.error.textContent = "Selecciona un archivo de imagen válido.";
      elements.error.hidden = false;
      elements.avatarFile.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        elements.error.textContent = "No se pudo previsualizar la imagen.";
        elements.error.hidden = false;
        return;
      }

      elements.avatarUrl.value = "";
      elements.avatarValue.value = reader.result;
      elements.error.hidden = true;
      setAvatar(elements.avatarPreview, reader.result, elements.name.value);
    };
    reader.onerror = () => {
      elements.error.textContent = "No se pudo leer el archivo de imagen.";
      elements.error.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  elements.avatarUrl.addEventListener("input", () => {
    const source = elements.avatarUrl.value.trim();
    elements.avatarFile.value = "";
    elements.avatarValue.value = source;
    setAvatar(elements.avatarPreview, source, elements.name.value);
  });

  elements.name.addEventListener("input", () => {
    const initials = getInitials(elements.name.value);
    const initialsElement = elements.avatarPreview.querySelector(
      ".user-initials-display",
    );
    if (initialsElement && elements.avatarPreview.querySelector("img").hidden) {
      initialsElement.textContent = initials;
    }
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.error.hidden = true;

    const avatarUrl = elements.avatarValue.value.trim();
    if (avatarUrl && !/^(https?:\/\/|data:image\/)/i.test(avatarUrl)) {
      elements.error.textContent =
        "La foto debe ser una URL HTTP(S) o una imagen seleccionada.";
      elements.error.hidden = false;
      return;
    }

    const profilePayload = {
      fullName: elements.name.value.trim(),
      email: elements.email.value.trim(),
      bio: elements.bio.value.trim(),
      avatarUrl,
      phone: elements.phone.value.trim(),
      contactEmail: user.contactEmail || "",
      socials: {
        ...user.socials,
        ...Object.fromEntries(
          SOCIAL_LINKS.map(({ key }) => [
            key,
            elements.socials[key].value.trim(),
          ]),
        ),
      },
    };

    try {
      const response = await authFetch(
        `${API_BASE_URL}/users/${user.id}`,
        {
          method: "PUT",
          body: JSON.stringify(profilePayload),
        },
      );

      if (!response.ok) {
        throw new Error(
          `El servidor rechazó la actualización (HTTP ${response.status}).`,
        );
      }

      const savedUser = await response.json();
      const updatedUser = { ...user, ...savedUser, token: user.token };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

      Object.assign(user, updatedUser);
      renderUser(user);
      window.dispatchEvent(new Event("houskytask:user-updated"));
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("editProfileModal"),
      ).hide();
    } catch (error) {
      console.error("No se pudo guardar el perfil en el backend:", error);
      if (
        error instanceof Error &&
        error.message.startsWith("El servidor rechazó")
      ) {
        elements.error.textContent = `${error.message} No se guardaron los cambios.`;
      } else if (error instanceof TypeError) {
        elements.error.textContent =
          "No se pudo conectar con el servidor. Verifica tu conexión y vuelve a intentarlo.";
      } else {
        elements.error.textContent =
          "No se pudo guardar el perfil. Inténtalo de nuevo.";
      }
      elements.error.hidden = false;
    }
  });

  try {
    await taskMetricsRequest;
  } finally {
    hidePageLoader();
  }
});
