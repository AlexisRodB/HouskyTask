// src/js/adapters/outbound/storage/ApiTaskRepo.js
import { authFetch } from "./authFetch.js";
import { API_BASE_URL } from "../../../shared/constants.js";

export class ApiTaskRepo {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/tasks`;
  }

  getCurrentUser() {
    const raw = localStorage.getItem('houskytask_user');
    if (!raw) {
      window.location.href = 'login.html';
      return null;
    }
    return JSON.parse(raw);
  }

  async findAll() {
    const user = this.getCurrentUser();
    if (!user) return [];
    const response = await authFetch(`${this.baseUrl}?userId=${user.id}`);
    if (!response.ok) {
      throw new Error(`No se pudieron cargar las tareas (HTTP ${response.status}).`);
    }
    return await response.json();
  }

  async findById(id) {
    const response = await authFetch(`${this.baseUrl}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`No se pudo cargar la tarea (HTTP ${response.status}).`);
    }
    return await response.json();
  }

  async save(task) {
    const user = this.getCurrentUser();
    if (!user) return;

    const isUpdate = task.id && String(task.id).length < 10;
    if (isUpdate) return this.update(task);

    const payload = { ...task, userId: user.id };
    delete payload.id;

    const response = await authFetch(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`No se pudo guardar la tarea (HTTP ${response.status}).`);
    }
    return await response.json();
  }

  async update(task) {
    const user = this.getCurrentUser();
    if (!user) return;
    if (!task.id) throw new Error('No se puede actualizar una tarea sin ID.');

    const response = await authFetch(`${this.baseUrl}/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...task, userId: user.id })
    });
    if (!response.ok) {
      throw new Error(`No se pudo actualizar la tarea (HTTP ${response.status}).`);
    }
    return await response.json();
  }

  async delete(id) {
    const response = await authFetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`No se pudo eliminar la tarea (HTTP ${response.status}).`);
    }
  }
}