import { LocalStorageTaskRepo } from '../../outbound/storage/LocalStorageTaskRepo.js';
import { CreateTask } from '../../../core/use-cases/CreateTask.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-duedate').value;
    const priority = document.getElementById('task-priority').value;
    const project = document.getElementById('task-project').value;
    const status = document.getElementById('task-status').value;

    try {
      const taskRepository = new LocalStorageTaskRepo();
      const createTaskUseCase = new CreateTask(taskRepository);

      await createTaskUseCase.execute({
        title,
        description,
        dueDate,
        priority,
        project,
        status
      });

      window.location.href = 'index.html';

    } catch (error) {
      console.error('Error al crear la tarea:', error);
      alert(`No se pudo crear la tarea: ${error.message}`);
    }
  });
});