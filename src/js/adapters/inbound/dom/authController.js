import { API_BASE_URL } from "../../../shared/constants.js";

const API_AUTH = `${API_BASE_URL}/auth`;

function saveAuthenticatedUser(data) {
  if (typeof data?.token !== 'string' || !data.token.trim()) {
    alert('El servidor no devolvió un token de acceso válido.');
    return false;
  }

  localStorage.setItem('houskytask_user', JSON.stringify(data));
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authCard = document.getElementById('auth-card');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const setAuthMode = (mode) => {
    const isRegistering = mode === 'register';
    authCard.classList.toggle('active', isRegistering);
    loginForm.closest('.form-container').setAttribute('aria-hidden', String(isRegistering));
    registerForm.closest('.form-container').setAttribute('aria-hidden', String(!isRegistering));
  };

  tabLogin.addEventListener('click', () => {
    setAuthMode('login');
    loginForm.querySelector('input').focus();
  });

  tabRegister.addEventListener('click', () => {
    setAuthMode('register');
    registerForm.querySelector('input').focus();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error al iniciar sesión');
    if (!saveAuthenticatedUser(data)) return;

    window.location.href = 'index.html';
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const res = await fetch(`${API_AUTH}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error al registrar usuario');
    if (!saveAuthenticatedUser(data)) return;

    window.location.href = 'index.html';
  });
});