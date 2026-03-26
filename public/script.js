function initAuthModal() {
  const authModal = document.getElementById("authModal");
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");

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
      ".auth-modal-overlay.active, .auth-panel-overlay.active"
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
}

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
}

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
    const response = await fetch(`/api/recipes?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("No se pudieron obtener las recetas");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      recipesMessage.textContent = "No se han encontrado recetas.";
      return;
    }

    recipesMessage.textContent = `Se han encontrado ${data.results.length} recetas.`;

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
  await loadComponent("header", "header.html");
  await loadComponent("footer", "footer.html");

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
}

initLayout();

