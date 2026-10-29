import { LocalStorageTaskRepo } from '../../outbound/storage/LocalStorageTaskRepo.js';

document.addEventListener('DOMContentLoaded', async () => {
  const taskRepo = new LocalStorageTaskRepo();
  const gridContainer = document.getElementById('calendar-grid-container');
  const monthTitle = document.getElementById('current-month-title');
  const subtitleText = document.getElementById('subtitle-text');
  const totalTasksCountEl = document.getElementById('total-tasks-month-count');
  const detailDayHeader = document.getElementById('detail-day-header');
  const detailTaskContent = document.getElementById('detail-task-content');
  const afterTodayContainer = document.getElementById('after-today-container');

  // Estado actual del calendario
  let viewDate = new Date();
  let selectedDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD por defecto hoy

  const monthsNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  async function renderCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-11

    // Actualizar título del mes
    const monthNameCapitalized = monthsNames[month].charAt(0).toUpperCase() + monthsNames[month].slice(1);
    if (monthTitle) monthTitle.textContent = `${monthNameCapitalized} ${year}`;
    if (subtitleText) subtitleText.textContent = `Todas tus tareas, en contexto. ${monthNameCapitalized} de ${year} empieza aquí.`;

    const tasks = await taskRepo.findAll();

    // Organizar tareas por fecha (YYYY-MM-DD)
    const tasksByDate = {};
    let monthTasksTotal = 0;

    tasks.forEach(t => {
      if (t.dueDate) {
        if (!tasksByDate[t.dueDate]) {
          tasksByDate[t.dueDate] = [];
        }
        tasksByDate[t.dueDate].push(t);

        // Contar tareas del mes actual visualizado
        const [tYear, tMonth] = t.dueDate.split('-').map(Number);
        if (tYear === year && tMonth === month + 1) {
          monthTasksTotal++;
        }
      }
    });

    if (totalTasksCountEl) totalTasksCountEl.textContent = `${monthTasksTotal} tarea${monthTasksTotal === 1 ? '' : 's'} este mes`;

    // Calcular días del mes
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // Lunes = 0
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Domingo = 6

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Construir semanas (filas de 7 días)
    let weeksHTML = '';
    let currentWeekHTML = '<div class="row row-cols-7 g-2">';
    let dayCount = 0;

    // 1. Días del mes anterior (relleno)
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevLastDay - i;
      const pMonth = month === 0 ? 12 : month;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      
      currentWeekHTML += renderDayCell(pDay, dateStr, tasksByDate[dateStr] || [], true, false);
      dayCount++;
    }

    // 2. Días del mes actual
    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      if (dayCount % 7 === 0 && dayCount > 0) {
        weeksHTML += currentWeekHTML + '</div>';
        currentWeekHTML = '<div class="row row-cols-7 g-2 mt-0">';
      }

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      currentWeekHTML += renderDayCell(day, dateStr, tasksByDate[dateStr] || [], false, isToday);
      dayCount++;
    }

    // 3. Días del mes siguiente (relleno para completar la última semana)
    let nextMonthDay = 1;
    while (dayCount % 7 !== 0) {
      const nMonth = month === 11 ? 1 : month + 2;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;

      currentWeekHTML += renderDayCell(nextMonthDay, dateStr, tasksByDate[dateStr] || [], true, false);
      nextMonthDay++;
      dayCount++;
    }
    weeksHTML += currentWeekHTML + '</div>';

    gridContainer.innerHTML = weeksHTML;

    // Activar eventos de selección de días
    attachDayClickEvents(tasksByDate, tasks);

    // Renderizar panel de detalles para la fecha seleccionada
    renderDayDetails(selectedDateStr, tasksByDate[selectedDateStr] || [], tasks);
  }

  function renderDayCell(dayNumber, dateStr, dayTasks, isOtherMonth, isToday) {
    const isSelected = dateStr === selectedDateStr;
    const hasTasks = dayTasks.length > 0;

    let badgeClass = 'bg-secondary';
    if (hasTasks) {
      if (dayTasks.some(t => t.priority === 'alta')) badgeClass = 'bg-danger';
      else if (dayTasks.every(t => t.status === 'completada')) badgeClass = 'bg-success';
    }

    return `
      <div class="col">
        <div class="calendar-grid-cell p-2 rounded d-flex flex-column justify-content-between ${isSelected ? 'selected' : ''} ${isOtherMonth ? 'opacity-50' : ''}" 
             data-date="${dateStr}" style="cursor: pointer; min-height: 105px;">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold ${isToday ? 'text-warning' : 'text-white'}" style="font-size: 0.85rem;">${dayNumber}</span>
            ${hasTasks ? `<span class="rounded-circle ${badgeClass}" style="width: 6px; height: 6px;" title="${dayTasks.length} tareas"></span>` : ''}
          </div>
          
          <div class="flex-grow-1 overflow-hidden d-flex flex-column gap-1" style="max-height: 70px;">
            ${dayTasks.slice(0, 2).map(t => `
              <div class="p-1 rounded bg-dark border border-secondary text-truncate" style="font-size: 0.65rem;" title="${t.title}">
                <span class="${t.status === 'completada' ? 'text-decoration-line-through text-muted' : 'text-white'}">${t.title}</span>
              </div>
            `).join('')}
            ${dayTasks.length > 2 ? `<small class="text-secondary" style="font-size: 0.6rem;">+${dayTasks.length - 2} más</small>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function attachDayClickEvents(tasksByDate, allTasks) {
    document.querySelectorAll('.calendar-grid-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-date');
        selectedDateStr = dateStr;
        
        document.querySelectorAll('.calendar-grid-cell').forEach(c => c.classList.remove('selected'));
        e.currentTarget.classList.add('selected');

        renderDayDetails(dateStr, tasksByDate[dateStr] || [], allTasks);
      });
    });
  }

  function renderDayDetails(dateStr, dayTasks, allTasks) {
    let formattedTitle = dateStr;
    if (dateStr) {
      const [year, month, day] = dateStr.split('-');
      const dateObj = new Date(year, month - 1, day);
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      formattedTitle = dateObj.toLocaleDateString('es-ES', options);
      formattedTitle = formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1);
    }

    if (detailDayHeader) {
      detailDayHeader.innerHTML = `SELECCIONADO · ${formattedTitle}`;
    }

    if (dayTasks.length > 0) {
      const mainTask = dayTasks[0];
      detailTaskContent.innerHTML = `
        <div class="text-secondary small mb-1"><i class="bi bi-clock me-1"></i> Entrega programada</div>
        <h5 class="fw-bold text-white mb-2">${mainTask.title}</h5>
        <p class="text-secondary small mb-3">${mainTask.description || 'Sin descripción adicional para esta tarea.'}</p>
        
        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="badge-priority-${mainTask.priority}" style="font-size: 0.65rem;">${mainTask.priority.toUpperCase()}</span>
          <span class="badge bg-dark border border-secondary text-white" style="font-size: 0.65rem;">${mainTask.status}</span>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between text-secondary small mb-1">
            <span>Proyecto: ${mainTask.project || 'General'}</span>
            <span>${mainTask.status === 'completada' ? '100%' : 'En progreso'}</span>
          </div>
          <div class="progress bg-dark border border-secondary" style="height: 6px;">
            <div class="progress-bar bg-warning" style="width: ${mainTask.status === 'completada' ? '100%' : '50%'}"></div>
          </div>
        </div>

        <a href="todasTareas.html" class="btn btn-primary-housky w-100 btn-sm py-2">
          <i class="bi bi-arrow-right-circle me-1"></i> Ver detalles completos
        </a>
      `;
    } else {
      detailTaskContent.innerHTML = `
        <div class="text-center py-4 text-secondary">
          <i class="bi bi-calendar-check fs-2 mb-2 text-muted"></i>
          <p class="small mb-1 text-white fw-bold">Sin tareas para este día</p>
          <p class="small text-secondary mb-3">Disfruta el tiempo libre o agenda un nuevo entregable.</p>
          <a href="agregarTarea.html" class="btn btn-primary-housky btn-sm">Agregar tarea</a>
        </div>
      `;
    }

    const afterTasks = allTasks.filter(t => t.dueDate && t.dueDate > selectedDateStr).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);

    if (afterTodayContainer) {
      if (afterTasks.length > 0) {
        afterTodayContainer.innerHTML = afterTasks.map(t => `
          <div class="p-2 rounded bg-dark border border-secondary d-flex justify-content-between align-items-center">
            <div>
              <div class="text-white fw-bold small mb-0">${t.title}</div>
              <small class="text-secondary" style="font-size: 0.7rem;">${t.dueDate} · ${t.project || 'General'}</small>
            </div>
            <span class="badge-priority-${t.priority}" style="font-size: 0.55rem;">${t.priority}</span>
          </div>
        `).join('');
      } else {
        afterTodayContainer.innerHTML = `<small class="text-secondary">No hay más tareas programadas adelante.</small>`;
      }
    }
  }

  // Navegación de meses
  document.getElementById('prev-month-btn')?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('next-month-btn')?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById('today-month-btn')?.addEventListener('click', () => {
    viewDate = new Date();
    selectedDateStr = new Date().toISOString().split('T')[0];
    renderCalendar();
  });

  renderCalendar();
});