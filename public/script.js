function initAuthModal() {
  const authModal = document.getElementById("authModal");
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");

  if (!authModal && !loginModal && !registerModal) return;

  const openButtons = document.querySelectorAll(".open-auth-modal");
  const closeMainBtn = document.getElementById("closeAuthModal");

  const openLoginBtn = document.getElementById("openLoginModal");
  const openRegisterBtn = document.getElementById("openRegisterModal");

  const switchToRegister = document.getElementById("switchToRegister");
  const switchToLogin = document.getElementById("switchToLogin");

  function openModal(modal) {
    if (!modal) return;

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("active");

    const anyOpen = document.querySelector(
      ".auth-modal-overlay.active, .auth-panel-overlay.active",
    );

    if (!anyOpen) {
      document.body.classList.remove("modal-open");
    }
  }

  function showMainModal() {
    authModal?.classList.add("active");
    loginModal?.classList.remove("active");
    registerModal?.classList.remove("active");

    document.body.classList.add("modal-open");
  }

  function showLoginModal() {
    authModal?.classList.remove("active");
    loginModal?.classList.add("active");
    registerModal?.classList.remove("active");

    document.body.classList.add("modal-open");
  }

  function showRegisterModal() {
    authModal?.classList.remove("active");
    loginModal?.classList.remove("active");
    registerModal?.classList.add("active");

    document.body.classList.add("modal-open");
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(authModal);
    });
  });

  if (closeMainBtn) {
    closeMainBtn.addEventListener("click", () => {
      closeModal(authModal);
    });
  }

  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", showLoginModal);
  }

  if (openRegisterBtn) {
    openRegisterBtn.addEventListener("click", showRegisterModal);
  }

  if (switchToRegister) {
    switchToRegister.addEventListener("click", showRegisterModal);
  }

  if (switchToLogin) {
    switchToLogin.addEventListener("click", showLoginModal);
  }

  document.querySelectorAll("[data-back-to-main]").forEach((btn) => {
    btn.addEventListener("click", showMainModal);
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-close-modal");
      const modal = document.getElementById(targetId);

      closeModal(modal);
    });
  });

  [authModal, loginModal, registerModal].forEach((modal) => {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  // LOGIN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();

      const password = document.getElementById("loginPassword").value.trim();

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Error al iniciar sesión");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/dashboard/dashboard.html";
      } catch (error) {
        console.error("Error login:", error);
        alert("No se pudo iniciar sesión");
      }
    });
  }

  // REGISTRO

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("registerName").value.trim();

      const email = document.getElementById("registerEmail").value.trim();

      const password = document.getElementById("registerPassword").value.trim();

      const confirmPassword = document
        .getElementById("confirmPassword")
        .value.trim();

      try {
        const registerData = {
          name,
          email,
          password,
          confirmPassword,
          edad: document.getElementById("registerEdad").value,
          sexo: document.getElementById("registerSexo").value,
          altura: document.getElementById("registerAltura").value,
          pesoActual: document.getElementById("registerPesoActual").value,
          pesoObjetivo: document.getElementById("registerPesoObjetivo").value,
          nivelActividad: document.getElementById("registerNivelActividad")
            .value,
          objetivo: document.getElementById("registerObjetivo").value,
        };

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Error al registrarse");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/dashboard/dashboard.html";
      } catch (error) {
        console.error("Error registro:", error);
        alert("No se pudo registrar el usuario");
      }
    });
  }
}
/*
async function loadComponent(id, file) {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const response = await fetch(file);
    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Error cargando ${file}:`, error);
  }
}*/

function createRecipeCard(recipe) {
  return `
    <article class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.title}" />
      <div class="recipe-card-body">
        <h3 class="recipe-card-title">${recipe.title}</h3>
        <p class="recipe-card-text">
          Descubre esta receta y consulta sus ingredientes y pasos.
        </p>
        <a class="recipe-card-link" href="/receta.html?id=${recipe.id}">
          Ver receta
        </a>
      </div>
    </article>
  `;
}

async function fetchRecipes(query = "pasta") {
  const recipesContainer = document.getElementById("recipesContainer");
  const recipesMessage = document.getElementById("recipesMessage");

  if (!recipesContainer || !recipesMessage) return;

  recipesMessage.textContent = "Cargando recetas...";
  recipesContainer.innerHTML = "";

  try {
    const response = await fetch(
      `/api/recipes?query=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las recetas");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      recipesMessage.textContent = "No se han encontrado recetas.";
      return;
    }

    recipesMessage.textContent = `Se han encontrado ${data.results.length} recetas. (39 máximo)`;

    recipesContainer.innerHTML = data.results
      .map((recipe) => createRecipeCard(recipe))
      .join("");
  } catch (error) {
    console.error(error);
    recipesMessage.textContent = "Ha ocurrido un error al cargar las recetas.";
  }
}

function initRecipeSearch() {
  const input = document.getElementById("recipeSearchInput");
  const button = document.getElementById("recipeSearchBtn");

  if (!input || !button) return;

  button.addEventListener("click", () => {
    const value = input.value.trim();
    fetchRecipes(value || "pasta");
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const value = input.value.trim();
      fetchRecipes(value || "pasta");
    }
  });

  fetchRecipes();
}

async function initLayout() {
  await loadHeader();
  await loadFooter();

  const mobileBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");

      const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
      mobileBtn.setAttribute("aria-expanded", String(!expanded));
    });
  }

  initAuthModal();
  initRecipeSearch();
  initLogout();
  initDashboardUserName();
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout();
});

async function loadHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const isDashboard = window.location.pathname.includes("/dashboard/");

  let file = "/header.html";

  if (isDashboard) {
    file = "/dashboard/header.html";
  }

  try {
    const res = await fetch(file);
    header.innerHTML = await res.text();
  } catch (err) {
    console.error("Error cargando header:", err);
  }
}

async function loadFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  const isDashboard = window.location.pathname.includes("/dashboard/");

  let file = "/footer.html";

  if (isDashboard) {
    file = "/dashboard/footer.html";
  }

  try {
    const res = await fetch(file);
    footer.innerHTML = await res.text();
  } catch (err) {
    console.error("Error cargando footer:", err);
  }
}

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("/index.html");
  });
}

function initDashboardUserName() {
  const nameElement = document.getElementById("dashboardUserName");
  if (!nameElement) return;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.name) {
    nameElement.textContent = user.name;
  }
}


const weeklyCalendar = document.getElementById("weeklyCalendar");
const weekRange = document.getElementById("weekRange");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");

let currentDate = new Date();
let weeklyMeals = [];

const dayNames = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const dayLabels = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const mealTypes = ["desayuno", "comida", "cena"];

const monthNames = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

function getToken() {
  return localStorage.getItem("token");
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateForAPI(date) {
  return date.toISOString().split("T")[0];
}

function formatWeekRange(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} - ${endDate.getDate()} ${monthNames[endDate.getMonth()]}`;
}

function isToday(date) {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

async function loadWeeklyMenu() {
  const token = getToken();

  if (!token) {
    weeklyCalendar.innerHTML = "<p>Debes iniciar sesión para ver tu menú semanal.</p>";
    return;
  }

  const startOfWeek = getStartOfWeek(currentDate);
  const weekStart = formatDateForAPI(startOfWeek);

  try {
    const response = await fetch(`/api/weekly-menu?weekStart=${weekStart}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    weeklyMeals = data.meals || [];

    renderWeek();
  } catch (error) {
    console.error(error);
    weeklyCalendar.innerHTML = "<p>Error cargando el menú semanal.</p>";
  }
}

function getMeal(day, mealType) {
  return weeklyMeals.find(
    meal => meal.day === day && meal.mealType === mealType
  );
}

function renderWeek() {
  weeklyCalendar.innerHTML = "";

  const startOfWeek = getStartOfWeek(currentDate);
  weekRange.textContent = formatWeekRange(startOfWeek);

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);

    const day = dayNames[i];

    const card = document.createElement("article");
    card.className = `day-card ${isToday(dayDate) ? "today" : ""}`;

    let mealsHTML = "";

    mealTypes.forEach(mealType => {
      const meal = getMeal(day, mealType);

      mealsHTML += `
        <div class="meal-block">
          <span class="meal-label">${mealType}</span>

          <div class="meal-value ${!meal ? "empty-meal" : ""}">
            ${
              meal
                ? meal.title
                : "Sin receta asignada"
            }
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="day-header">
        <span class="day-name">${dayLabels[i]}</span>
        <span class="day-date">${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}</span>
      </div>

      ${mealsHTML}
    `;

    weeklyCalendar.appendChild(card);
  }
}

prevWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7);
  loadWeeklyMenu();
});

nextWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7);
  loadWeeklyMenu();
});

loadWeeklyMenu();