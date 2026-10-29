function updateCurrentDate() {
  const formattedDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  document.querySelectorAll("[data-current-date]").forEach((element) => {
    element.textContent = formattedDate;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateCurrentDate, {
    once: true,
  });
} else {
  updateCurrentDate();
}
