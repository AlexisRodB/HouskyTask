const SESSION_KEY = "houskytask_user";
const USER_UPDATED_EVENT = "houskytask:user-updated";

function getInitials(fullName) {
  const words = (fullName || "Usuario").trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderSessionUser() {
  const rawUser = localStorage.getItem(SESSION_KEY);
  if (!rawUser) {
    window.location.href = "login.html";
    return;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch (error) {
    console.error("No se pudo leer el usuario de la sesión:", error);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
    return;
  }

  if (
    !user ||
    typeof user !== "object" ||
    typeof user.token !== "string" ||
    !user.token.trim()
  ) {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
    return;
  }

  const fullName =
    (typeof user.fullName === "string" && user.fullName.trim()) || "Usuario";
  const initials = getInitials(fullName);
  const email = typeof user.email === "string" ? user.email : "";

  document.querySelectorAll(".user-fullname-display").forEach((element) => {
    element.textContent = fullName;
  });

  document.querySelectorAll(".user-initials-display").forEach((element) => {
    element.textContent = initials;
    element.hidden = false;
  });

  document.querySelectorAll(".user-email-display").forEach((element) => {
    element.textContent = email || "Sin correo registrado";
  });

  document.querySelectorAll(".user-avatar-image").forEach((image) => {
    const initialsElement = image.parentElement?.querySelector(
      ".user-initials-display",
    );
    const rawAvatarUrl =
      typeof user.avatarUrl === "string" ? user.avatarUrl.trim() : "";
    const avatarUrl = /^(https?:\/\/|data:image\/)/i.test(rawAvatarUrl)
      ? rawAvatarUrl
      : "";

    image.onload = () => {
      image.hidden = false;
      if (initialsElement) initialsElement.hidden = true;
    };
    image.onerror = () => {
      image.hidden = true;
      if (initialsElement) initialsElement.hidden = false;
    };

    if (avatarUrl) {
      image.src = avatarUrl;
    } else {
      image.removeAttribute("src");
      image.hidden = true;
      if (initialsElement) initialsElement.hidden = false;
    }
  });
}

function attachLogoutHandlers() {
  document.querySelectorAll(".btn-logout").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "login.html";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSessionUser();
  attachLogoutHandlers();
});

window.addEventListener(USER_UPDATED_EVENT, renderSessionUser);
