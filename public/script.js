function initAuthModal() {
  const modal = document.getElementById("authModal");
  const openBtn = document.getElementById("openAuthModal");
  const closeBtn = document.getElementById("closeAuthModal");

  if (!modal || !openBtn) return;

  // 👉 ABRIR
  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // 👉 CERRAR con botón
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // 👉 CERRAR clic fuera
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
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