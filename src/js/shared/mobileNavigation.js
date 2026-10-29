const navigationItems = [
  { href: "index.html", icon: "bi-house-door", label: "Inicio" },
  { href: "agregarTarea.html", icon: "bi-plus-circle", label: "Agregar tarea" },
  { href: "todasTareas.html", icon: "bi-list-task", label: "Todas las tareas" },
  { href: "calendario.html", icon: "bi-calendar3", label: "Calendario" },
  { href: "perfil.html", icon: "bi-person", label: "Perfil" },
  { href: "tablero.html", icon: "bi-kanban", label: "Tablero visual" },
];

function createMobileNavigation() {
  const activePage = window.location.pathname.split("/").pop() || "index.html";
  const header = document.createElement("header");
  header.className =
    "mobile-header-bar d-flex d-lg-none justify-content-between align-items-center p-3 border-bottom";
  header.style.cssText =
    "background-color: var(--bg-surface); border-color: var(--border-color) !important;";

  const brandGroup = document.createElement("div");
  brandGroup.className = "d-flex align-items-center gap-2";

  const toggleButton = document.createElement("button");
  toggleButton.className = "btn text-white p-0 border-0";
  toggleButton.type = "button";
  toggleButton.setAttribute("data-bs-toggle", "offcanvas");
  toggleButton.setAttribute("data-bs-target", "#mobileNavigationDrawer");
  toggleButton.setAttribute("aria-controls", "mobileNavigationDrawer");
  toggleButton.setAttribute("aria-label", "Abrir menú de navegación");
  toggleButton.innerHTML =
    '<i class="bi bi-list fs-3" style="color: var(--accent-orange)"></i>';

  const brand = document.createElement("a");
  brand.className = "fs-5 fw-bold text-white text-decoration-none";
  brand.href = "index.html";
  brand.textContent = "HouskyTask";
  brandGroup.append(toggleButton, brand);

  const initials = document.createElement("span");
  initials.className =
    "rounded-circle text-white d-flex align-items-center justify-content-center fw-bold";
  initials.style.cssText =
    "width: 32px; height: 32px; font-size: 0.8rem; background-color: var(--accent-orange);";
  initials.textContent = "AR";
  header.append(brandGroup, initials);

  const drawer = document.createElement("div");
  drawer.className = "offcanvas offcanvas-start text-white";
  drawer.id = "mobileNavigationDrawer";
  drawer.tabIndex = -1;
  drawer.setAttribute("aria-labelledby", "mobileNavigationTitle");
  drawer.style.cssText =
    "width: 280px; background-color: var(--bg-surface);";

  const drawerHeader = document.createElement("div");
  drawerHeader.className = "offcanvas-header border-bottom";
  drawerHeader.style.borderColor = "var(--border-color)";
  const title = document.createElement("h5");
  title.className = "offcanvas-title d-flex align-items-center";
  title.id = "mobileNavigationTitle";
  title.innerHTML =
    '<i class="bi bi-check2-square fs-4 me-2" style="color: var(--accent-orange)"></i> HouskyTask';

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close btn-close-white";
  closeButton.setAttribute("data-bs-dismiss", "offcanvas");
  closeButton.setAttribute("aria-label", "Cerrar menú");
  drawerHeader.append(title, closeButton);

  const drawerBody = document.createElement("div");
  drawerBody.className =
    "offcanvas-body d-flex flex-column justify-content-between p-3";
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Navegación principal");
  const sectionTitle = document.createElement("div");
  sectionTitle.className =
    "text-secondary small mb-2 text-uppercase fw-bold";
  sectionTitle.style.fontSize = "0.75rem";
  sectionTitle.textContent = "Espacio personal";
  const list = document.createElement("ul");
  list.className = "nav nav-pills flex-column gap-1";

  navigationItems.forEach((item) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.className = "nav-link text-secondary";
    link.href = item.href;
    link.innerHTML = `<i class="bi ${item.icon} me-2"></i> ${item.label}`;

    if (item.href === activePage) {
      link.className = "nav-link active text-white";
      link.style.cssText =
        "background-color: rgba(255, 107, 0, 0.15); border-left: 3px solid var(--accent-orange);";
      link.setAttribute("aria-current", "page");
    }

    listItem.append(link);
    list.append(listItem);
  });

  nav.append(sectionTitle, list);

  const footer = document.createElement("div");
  footer.className = "pt-3 border-top";
  footer.style.borderColor = "var(--border-color)";
  footer.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
        style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));">AR</span>
      <div>
        <div class="text-white fw-bold small">Alexis Rodríguez B.</div>
        <div class="text-secondary" style="font-size: 0.75rem">Mi espacio personal</div>
      </div>
    </div>`;

  drawerBody.append(nav, footer);
  drawer.append(drawerHeader, drawerBody);
  document.body.prepend(drawer);
  document.body.prepend(header);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createMobileNavigation, {
    once: true,
  });
} else {
  createMobileNavigation();
}
