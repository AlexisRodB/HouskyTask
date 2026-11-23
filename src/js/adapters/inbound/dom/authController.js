import { API_BASE_URL } from "../../../shared/constants.js";

const API_AUTH = `${API_BASE_URL}/auth`;
const OTP_COOLDOWN_SECONDS = 60;

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
  const registerEmail = document.getElementById('reg-email');
  const otpCard = document.getElementById('otp-card');
  const registerOtp = document.getElementById('regOtp');
  const sendOtpButton = document.getElementById('btnSendOtp');
  const sendOtpLabel = document.getElementById('sendOtpLabel');
  const otpFeedback = document.getElementById('otpFeedback');
  let otpCountdown;

  const showOtpFeedback = (message, type) => {
    otpFeedback.textContent = message;
    otpFeedback.classList.toggle('is-success', type === 'success');
    otpFeedback.classList.toggle('is-error', type === 'error');
    otpFeedback.hidden = false;
  };

  const revealOtpCard = () => {
    otpCard.hidden = false;
    registerOtp.disabled = false;
  };

  const startOtpCooldown = () => {
    const expiresAt = Date.now() + OTP_COOLDOWN_SECONDS * 1000;
    sendOtpButton.disabled = true;

    const updateCountdown = () => {
      const secondsLeft = Math.ceil((expiresAt - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        window.clearInterval(otpCountdown);
        sendOtpButton.disabled = false;
        sendOtpLabel.textContent = 'Enviar código';
        return;
      }

      sendOtpLabel.textContent = `Reenviar en ${secondsLeft}s`;
    };

    updateCountdown();
    otpCountdown = window.setInterval(updateCountdown, 1000);
  };

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

  sendOtpButton.addEventListener('click', async () => {
    if (!registerEmail.checkValidity()) {
      registerEmail.reportValidity();
      return;
    }

    revealOtpCard();
    sendOtpButton.disabled = true;
    sendOtpLabel.textContent = 'Enviando...';
    otpFeedback.hidden = true;

    try {
      const response = await fetch(`${API_AUTH}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail.value.trim() })
      });
      const data = await response.json();

      if (!response.ok) {
        showOtpFeedback(data.message || 'No se pudo enviar el código.', 'error');
        sendOtpLabel.textContent = 'Enviar código';
        sendOtpButton.disabled = false;
        return;
      }

      showOtpFeedback('Revisa tu bandeja de entrada o spam.', 'success');
      registerOtp.focus();
      startOtpCooldown();
    } catch (error) {
      console.error('Error al solicitar el código de verificación:', error);
      showOtpFeedback('No se pudo enviar el código. Inténtalo de nuevo.', 'error');
      sendOtpLabel.textContent = 'Enviar código';
      sendOtpButton.disabled = false;
    }
  });

  registerOtp.addEventListener('input', () => {
    registerOtp.value = registerOtp.value.replace(/\D/g, '').slice(0, 6);
    registerOtp.setCustomValidity('');
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
    const otpCode = registerOtp.value.trim();

    revealOtpCard();

    if (!/^[0-9]{6}$/.test(otpCode)) {
      registerOtp.setCustomValidity('Ingresa el código de verificación de 6 dígitos.');
      registerOtp.reportValidity();
      registerOtp.focus();
      showOtpFeedback('El código debe contener exactamente 6 dígitos.', 'error');
      return;
    }

    registerOtp.setCustomValidity('');

    try {
      const res = await fetch(`${API_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, otpCode })
      });

      const data = await res.json();
      if (!res.ok) {
        showOtpFeedback(data.message || 'No se pudo crear la cuenta.', 'error');
        return;
      }
      if (!saveAuthenticatedUser(data)) return;

      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error al registrar la cuenta:', error);
      showOtpFeedback('No se pudo completar el registro. Inténtalo de nuevo.', 'error');
    }
  });
});