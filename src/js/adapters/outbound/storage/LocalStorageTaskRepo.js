import { ITaskRepository } from '../../../ports/outbound/ITaskRepository.js';
import { Task } from '../../../core/models/task.js';

/* tareas */
export class LocalStorageTaskRepo extends ITaskRepository {
  constructor(storageKey = 'houskytask_data') {
    super();
    this.storageKey = storageKey;
  }

  /**
   * Obtiene todas las tareas almacenadas y las mapea a instancias de Task.
   * @returns {Promise<Task[]>}
   */
  async findAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const rawTasks = JSON.parse(data);
      return rawTasks.map(plain => Task.fromJSON(plain));
    } catch (error) {
      console.error('Error al leer de LocalStorage:', error);
      return [];
    }
  }

  /**
   * Guarda o actualiza una tarea en el almacenamiento local.
   * @param {Task} task 
   * @returns {Promise<Task>}
   */
  async save(task) {
    try {
      const tasks = await this.findAll();
      const index = tasks.findIndex(t => t.id === task.id);

      if (index >= 0) {
        tasks[index] = task;
      } else {
        tasks.push(task);
      }

      this._persist(tasks);
      return task;
    } catch (error) {
      console.error('Error al guardar en LocalStorage:', error);
      throw new Error('No se pudo guardar la tarea en el almacenamiento local.');
    }
  }

  /**
   * Busca una tarea por su ID.
   * @param {string} id 
   * @returns {Promise<Task|null>}
   */
  async findById(id) {
    const tasks = await this.findAll();
    return tasks.find(t => t.id === id) || null;
  }

  /**
   * Elimina una tarea por su ID.
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    try {
      let tasks = await this.findAll();
      const initialLength = tasks.length;
      
      tasks = tasks.filter(t => t.id !== id);
      
      if (tasks.length === initialLength) return false;

      this._persist(tasks);
      return true;
    } catch (error) {
      console.error('Error al eliminar de LocalStorage:', error);
      return false;
    }
  }

  /**
   * Método privado auxiliar para escribir en localStorage.
   * @private
   */
  _persist(tasks) {
    const serialized = tasks.map(t => t.toJSON());
    localStorage.setItem(this.storageKey, JSON.stringify(serialized));
  }
}