// src/js/adapters/outbound/storage/ApiTaskRepo.js
export class ApiTaskRepo {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/v1/tasks';
  }

  async findAll() {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error('Error al obtener tareas del servidor');
      return await response.json();
    } catch (error) {
      console.error('Error en ApiTaskRepo.findAll:', error);
      return [];
    }
  }

  async findById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error(`Tarea ${id} no encontrada`);
      return await response.json();
    } catch (error) {
      console.error('Error en ApiTaskRepo.findById:', error);
      return null;
    }
  }

  async save(task) {
    try {
      // Si la tarea tiene un ID existente en BD (y no es un timestamp gigante generado en front), hacemos PUT
      const isUpdate = task.id && String(task.id).length < 10;
      const url = isUpdate ? `${this.baseUrl}/${task.id}` : this.baseUrl;
      const method = isUpdate ? 'PUT' : 'POST';

      // Eliminamos el id temporal si es creación para que PostgreSQL/H2 genere el autoincremental
      const payload = { ...task };
      if (!isUpdate) delete payload.id;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al guardar la tarea en el servidor');
      return await response.json();
    } catch (error) {
      console.error('Error en ApiTaskRepo.save:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar la tarea');
    } catch (error) {
      console.error('Error en ApiTaskRepo.delete:', error);
      throw error;
    }
  }
}