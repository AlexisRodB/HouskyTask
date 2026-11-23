// src/js/adapters/outbound/storage/ApiTaskRepo.js
export class ApiTaskRepo {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/v1/tasks';
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
    const response = await fetch(`${this.baseUrl}?userId=${user.id}`);
    return response.ok ? await response.json() : [];
  }

  async findById(id) {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.ok ? await response.json() : null;
  }

  async save(task) {
    const user = this.getCurrentUser();
    if (!user) return;

    const isUpdate = task.id && String(task.id).length < 10;
    const url = isUpdate ? `${this.baseUrl}/${task.id}` : this.baseUrl;
    const method = isUpdate ? 'PUT' : 'POST';

    const payload = { ...task, userId: user.id };
    if (!isUpdate) delete payload.id;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al guardar tarea');
    return await response.json();
  }

  async delete(id) {
    await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }
}