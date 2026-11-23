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
    '<i class="bi bi-list fs-3 mobile-nav-accent"></i>';

  const brand = document.createElement("a");
  brand.className = "fs-5 fw-bold text-white text-decoration-none";
  brand.href = "index.html";
  brand.textContent = "HouskyTask";
  brandGroup.append(toggleButton, brand);

  header.append(brandGroup);

  const drawer = document.createElement("div");
  drawer.className =
    "offcanvas offcanvas-start text-white mobile-navigation-drawer";
  drawer.id = "mobileNavigationDrawer";
  drawer.tabIndex = -1;
  drawer.setAttribute("aria-labelledby", "mobileNavigationTitle");

  const drawerHeader = document.createElement("div");
  drawerHeader.className = "offcanvas-header border-bottom mobile-nav-header";
  const title = document.createElement("h5");
  title.className = "offcanvas-title d-flex align-items-center";
  title.id = "mobileNavigationTitle";
  title.innerHTML =
    '<i class="bi bi-check2-square fs-4 me-2 mobile-nav-accent"></i> HouskyTask';

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
    "text-secondary small mb-2 text-uppercase fw-bold mobile-nav-section-title";
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
      link.className = "nav-link active text-white mobile-nav-link-active";
      link.setAttribute("aria-current", "page");
    }

    listItem.append(link);
    list.append(listItem);
  });

  nav.append(sectionTitle, list);

  const footer = document.createElement("div");
  footer.className = "pt-3 border-top mobile-nav-footer";
  footer.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <a href="perfil.html" class="d-flex align-items-center text-decoration-none text-white gap-2">
        <span class="user-avatar user-avatar--small">
          <span class="user-initials-display">--</span>
          <img class="user-avatar-image" alt="Foto de perfil" hidden>
        </span>
        <span class="small fw-semibold user-fullname-display">Cargando...</span>
      </a>
      <button type="button" class="btn btn-sm btn-outline-secondary btn-logout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
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
