const API_AUTH = 'http://localhost:8080/api/v1/auth';

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active', 'text-white');
    tabRegister.classList.remove('active', 'text-white');
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active', 'text-white');
    tabLogin.classList.remove('active', 'text-white');
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
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

    const user = await res.json();
    if (!res.ok) return alert(user.message || 'Error al iniciar sesión');

    localStorage.setItem('houskytask_user', JSON.stringify(user));
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

    const user = await res.json();
    if (!res.ok) return alert(user.message || 'Error al registrar usuario');

    localStorage.setItem('houskytask_user', JSON.stringify(user));
    window.location.href = 'index.html';
  });
});