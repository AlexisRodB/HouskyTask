const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateOnly(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || "");
  if (!match) return null;

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsedDate = new Date(timestamp);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function getDaysUntilDueDate(dueDate, today = new Date()) {
  const dueTimestamp = parseDateOnly(dueDate);
  if (dueTimestamp === null || Number.isNaN(today.getTime())) return null;

  const todayTimestamp = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((dueTimestamp - todayTimestamp) / MILLISECONDS_PER_DAY);
}

export function getDeadlineMessage(dueDate, today = new Date()) {
  const daysUntilDue = getDaysUntilDueDate(dueDate, today);
  if (daysUntilDue === null) return null;

  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return `Esta tarea venció hace ${daysOverdue} ${daysOverdue === 1 ? "día" : "días"}.`;
  }

  if (daysUntilDue === 0) return "La entrega es hoy.";

  return `Faltan ${daysUntilDue} ${daysUntilDue === 1 ? "día" : "días"} para la entrega.`;
}

export function getTasksDueWithinRange(
  tasks,
  today = new Date(),
  daysBefore = 7,
  daysAhead = 7,
) {
  return tasks
    .filter((task) => task.status !== "completada")
    .map((task) => ({
      task,
      daysUntilDue: getDaysUntilDueDate(task.dueDate, today),
    }))
    .filter(
      ({ daysUntilDue }) =>
        daysUntilDue !== null &&
        daysUntilDue >= -daysBefore &&
        daysUntilDue <= daysAhead,
    )
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .map(({ task }) => task);
}
