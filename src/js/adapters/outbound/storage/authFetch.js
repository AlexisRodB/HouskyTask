const SESSION_KEY = "houskytask_user";

function getSessionToken() {
  let user;

  try {
    user = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
  }

  if (!user || typeof user.token !== "string" || !user.token.trim()) {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
    throw new Error("Se requiere una sesión válida para continuar.");
  }

  return user.token;
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${getSessionToken()}`);

  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
    throw new Error(`La sesión expiró o no tiene acceso (HTTP ${response.status}).`);
  }

  return response;
}
