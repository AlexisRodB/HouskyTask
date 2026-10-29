export class Task {
  constructor({
    id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title,
    description = '',
    dueDate,
    time = '',
    priority = 'media',
    status = 'pendiente',
    project = 'General',
    createdAt = new Date().toISOString()
  }) {
    if (!title || title.trim() === '') {
      throw new Error('El dominio rechaza la tarea: El título es obligatorio.');
    }

    this.id = id;
    this.title = title.trim();
    this.description = description.trim();
    this.dueDate = dueDate || new Date().toISOString().split('T')[0];
    this.time = time;
    this.priority = priority;
    this.status = status;
    this.project = project.trim();
    this.createdAt = createdAt;
  }

  /**
   * Cambia el estado de la tarea asegurando reglas de transición si es necesario.
   * @param {string} newStatus 
   */
  changeStatus(newStatus) {
    const validStatuses = ['pendiente', 'en-curso', 'completada'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado no válido: ${newStatus}`);
    }
    this.status = newStatus;
  }

  /*mapeo entidad a objeto*/
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      time: this.time,
      priority: this.priority,
      status: this.status,
      project: this.project,
      createdAt: this.createdAt
    };
  }

  /**
   * Reconstruye una instancia de Task a partir de un objeto plano (ej. leído de LocalStorage o Base de Datos).
   * @param {Object} plainObject 
   * @returns {Task}
   */
  static fromJSON(plainObject) {
    return new Task({
      id: plainObject.id,
      title: plainObject.title,
      description: plainObject.description,
      dueDate: plainObject.dueDate,
      time: plainObject.time,
      priority: plainObject.priority,
      status: plainObject.status,
      project: plainObject.project,
      createdAt: plainObject.createdAt
    });
  }
}