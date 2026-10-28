import { Task } from '../models/task.js';
export class CreateTask {
  /**
   * @param {import('../../ports/outbound/ITaskRepository.js').ITaskRepository} taskRepository 
   */
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Ejecuta la creación de una tarea.
   * @param {Object} taskData Datos enviados desde la UI
   * @returns {Promise<Task>} La tarea creada y guardada
   */
  async execute(taskData) {
    const newTask = new Task(taskData);

    const savedTask = await this.taskRepository.save(newTask);

    return savedTask;
  }
}