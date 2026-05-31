function showToast(message, type = "error") {
  let toast = document.getElementById("toastMessage");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMessage";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast-message ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

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
    btn.addEventListener("click", () => openModal(authModal));
  });

  closeMainBtn?.addEventListener("click", () => closeModal(authModal));
  openLoginBtn?.addEventListener("click", showLoginModal);
  openRegisterBtn?.addEventListener("click", showRegisterModal);
  switchToRegister?.addEventListener("click", showRegisterModal);
  switchToLogin?.addEventListener("click", showLoginModal);

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

  const loginForm = document.getElementById("loginForm");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/dashboard/dashboard.html";
    } catch (error) {
      console.error("Error login:", error);
      showToast("No se pudo iniciar sesión");
    }
  });

  const registerForm = document.getElementById("registerForm");

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const registerData = {
      name: document.getElementById("registerName").value.trim(),
      email: document.getElementById("registerEmail").value.trim(),
      password: document.getElementById("registerPassword").value.trim(),
      confirmPassword: document.getElementById("confirmPassword").value.trim(),
      edad: document.getElementById("registerEdad").value,
      sexo: document.getElementById("registerSexo").value,
      altura: document.getElementById("registerAltura").value,
      pesoActual: document.getElementById("registerPesoActual").value,
      pesoObjetivo: document.getElementById("registerPesoObjetivo").value,
      nivelActividad: document.getElementById("registerNivelActividad").value,
      objetivo: document.getElementById("registerObjetivo").value,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Error al registrarse");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/dashboard/dashboard.html";
    } catch (error) {
      console.error("Error registro:", error);
      showToast("No se pudo registrar el usuario");
    }
  });
}

async function loadHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const isDashboard = window.location.pathname.includes("/dashboard/");
  const file = isDashboard ? "/dashboard/header.html" : "/header.html";

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
  const file = isDashboard ? "/dashboard/footer.html" : "/footer.html";

  try {
    const res = await fetch(file);
    footer.innerHTML = await res.text();
  } catch (err) {
    console.error("Error cargando footer:", err);
  }
}

function createRecipeCard(recipe, showAddButton = false) {
  return `
    <article class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.title}" />

      <div class="recipe-card-body">
        <h3 class="recipe-card-title">${recipe.title}</h3>

        <p class="recipe-card-text">
          Descubre esta receta y añádela a tu menú semanal.
        </p>

        <div class="recipe-card-actions">

          <a
            href="${
              showAddButton
                ? `/dashboard/recetas.html?id=${recipe.id}`
                : `/receta.html?id=${recipe.id}`
            }"
            class="recipe-card-link"
          >
            Ver receta
          </a>

          ${
            showAddButton
              ? `
                <button
                  type="button"
                  class="save-recipe-btn"
                  data-id="${recipe.id}"
                  data-title="${recipe.title}"
                  data-image="${recipe.image}"
                >
                  Guardar
                </button>

                <button
                  type="button"
                  class="add-to-menu-btn"
                  data-id="${recipe.id}"
                  data-title="${recipe.title}"
                  data-image="${recipe.image}"
                >
                  Añadir
                </button>
              `
              : ""
          }

        </div>
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

    recipesMessage.textContent = `Se han encontrado ${data.results.length} recetas.`;

    const isDashboard = window.location.pathname.includes("/dashboard/");

    recipesContainer.innerHTML = data.results
      .map((recipe) => createRecipeCard(recipe, isDashboard))
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

  const userRaw = localStorage.getItem("user");
  if (!userRaw) return;

  const user = JSON.parse(userRaw);

  if (user && user.name) {
    nameElement.textContent = user.name;
  }
}

let selectedRecipe = null;

function getStartOfCurrentWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function generateWeekOptions() {
  const select = document.getElementById("menuWeekSelect");

  if (!select) return;

  select.innerHTML = "";

  const months = [
    "ene","feb","mar","abr","may","jun",
    "jul","ago","sep","oct","nov","dic"
  ];

  for (let i = 0; i < 8; i++) {
    const start = getStartOfCurrentWeek(new Date());

    start.setDate(start.getDate() + i * 7);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const label =
      `${start.getDate()} ${months[start.getMonth()]} - ` +
      `${end.getDate()} ${months[end.getMonth()]}`;

    const option = document.createElement("option");

    option.value = formatDateForAPI(start);
    option.textContent = label;

    select.appendChild(option);
  }
}

function formatDateForAPI(date) {
  return date.toISOString().split("T")[0];
}

function openMenuModalFromButton(btn) {
  const modal = document.getElementById("menuModal");

  selectedRecipe = {
    recipeId: Number(btn.dataset.id),
    title: btn.dataset.title,
    image: btn.dataset.image,
  };

  const dateInput = document.getElementById("menuDateInput");

  if (dateInput) {
    dateInput.value = formatDateForAPI(new Date());
  }

  modal.classList.add("active");
}

function showMenuMessage(text) {
  const modalContent = document.querySelector(".menu-modal-content");

  let message = document.getElementById("menuSuccessMessage");

  if (!message) {
    message = document.createElement("div");
    message.id = "menuSuccessMessage";
    message.className = "menu-success-message";
    modalContent.appendChild(message);
  }

  message.textContent = text;
  message.classList.add("active");

  setTimeout(() => {
    message.classList.remove("active");
    document.getElementById("menuModal").classList.remove("active");
  }, 1400);
}

function initAddToMenu() {
  const modal = document.getElementById("menuModal");
  const closeBtn = document.getElementById("closeMenuModal");
  const saveBtn = document.getElementById("saveMenuRecipeBtn");
  const recipesContainer = document.getElementById("recipesContainer");

  if (!modal || !saveBtn || !recipesContainer) {
    console.error("Falta modal, botón guardar o contenedor de recetas");
    return;
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".add-to-menu-btn");
    if (!btn) return;

    selectedRecipe = {
      recipeId: Number(btn.dataset.id),
      title: btn.dataset.title,
      image: btn.dataset.image,
    };

    generateWeekOptions();

    modal.classList.add("active");
  });

  closeBtn?.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });

  saveBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Debes iniciar sesión");
      return;
    }

    if (!selectedRecipe) {
      showToast("No hay ninguna receta seleccionada");
      return;
    }

    const weekSelect = document.getElementById("menuWeekSelect");
    const weekStart = weekSelect.value;

    if (!weekStart) {
      showToast("Selecciona una semana");
      return;
    }

    const body = {
      weekStart,
      day: document.getElementById("menuDaySelect").value,
      mealType: document.getElementById("menuMealSelect").value,
      ...selectedRecipe,
    };

    try {
      const response = await fetch("/api/weekly-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 409) {
        const confirmed = confirm(
          `Ya tienes "${data.existingMeal.title}" en ese hueco.\n\n¿Quieres reemplazarla?`
        );

        if (!confirmed) return;

        const replaceResponse = await fetch("/api/weekly-menu", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...body,
            replace: true,
          }),
        });

        if (!replaceResponse.ok) {
          showToast("No se pudo reemplazar la receta");
          return;
        }

        showMenuMessage("Receta reemplazada correctamente ✅");
        return;
      }

      if (!response.ok) {
        showToast(data.error || "No se pudo añadir la receta");
        return;
      }

      showMenuMessage("Receta añadida al menú semanal ✅");
    } catch (error) {
      console.error(error);
      showToast("Error al guardar la receta en el menú");
    }
  });
}

function initSaveRecipe() {
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".save-recipe-btn");
    if (!btn) return;

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Debes iniciar sesión para guardar recetas");
      return;
    }

    const body = {
      recipeId: Number(btn.dataset.id),
      title: btn.dataset.title,
      image: btn.dataset.image,
    };

    try {
      const response = await fetch("/api/saved-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 409) {
        showToast("Esta receta ya está guardada");
        return;
      }

      if (!response.ok) {
        showToast(data.error || "No se pudo guardar la receta");
        return;
      }

      showToast("Receta guardada correctamente ✅");
    } catch (error) {
      console.error(error);
      showToast("Error guardando la receta");
    }
  });
}

async function loadDashboardSavedRecipes() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const container = document.getElementById("dashboardSavedRecipes");

  if (!container) return;

  try {
    const response = await fetch("/api/saved-recipes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) return;

    const recipes = data.recipes.slice(0, 3);

    if (recipes.length === 0) {
      container.innerHTML = `
        <p class="empty-state">
          Todavía no tienes recetas guardadas.
        </p>
      `;
      return;
    }

    container.innerHTML = recipes
  .map(
    (recipe) => `
      <article class="saved-recipe">
        <img
          src="${recipe.image}"
          alt="${recipe.title}"
        />

        <div>
          <h4>${recipe.title}</h4>

          <p>Receta guardada en tu colección.</p>

          <a
            href="/dashboard/Receta/receta.html?id=${recipe.recipeId}"
          >
            Ver receta
          </a>
        </div>
      </article>
    `
  )
  .join("");
  } catch (error) {
    console.error(error);
  }
}

async function loadDashboardSummary() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const savedRecipesCount = document.getElementById("savedRecipesCount");
  const weeklyMealsCount = document.getElementById("weeklyMealsCount");
  const shoppingItemsCount = document.getElementById("shoppingItemsCount");

  if (!savedRecipesCount && !weeklyMealsCount && !shoppingItemsCount) return;

  const weekStart = formatDateForAPI(getStartOfCurrentWeek(new Date()));

  try {
    const savedResponse = await fetch("/api/saved-recipes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const savedData = await savedResponse.json();

    if (savedResponse.ok && savedRecipesCount) {
      savedRecipesCount.textContent = savedData.recipes.length;
    }

    const menuResponse = await fetch(`/api/weekly-menu?weekStart=${weekStart}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const menuData = await menuResponse.json();

    if (menuResponse.ok && weeklyMealsCount) {
      weeklyMealsCount.textContent = `${menuData.meals.length} / 21`;
    }

    const shoppingResponse = await fetch(`/api/shopping-list?weekStart=${weekStart}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const shoppingData = await shoppingResponse.json();

    if (shoppingResponse.ok && shoppingItemsCount) {
      shoppingItemsCount.textContent = shoppingData.items.length;
    }
  } catch (error) {
    console.error("Error cargando resumen del dashboard:", error);
  }
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
  initAddToMenu();
  initSaveRecipe();
  loadDashboardSummary();
  loadDashboardSavedRecipes();
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout();
});
