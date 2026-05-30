const savedRecipesContainer = document.getElementById("savedRecipesContainer");
const savedRecipesMessage = document.getElementById("savedRecipesMessage");

async function loadSavedRecipes() {
  const token = localStorage.getItem("token");

  if (!token) {
    savedRecipesMessage.textContent = "Debes iniciar sesión para ver tus recetas guardadas.";
    return;
  }

  savedRecipesMessage.textContent = "Cargando recetas guardadas...";

  try {
    const response = await fetch("/api/saved-recipes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error cargando recetas");
    }

    if (!data.recipes || data.recipes.length === 0) {
      savedRecipesMessage.textContent = "Todavía no tienes recetas guardadas.";
      return;
    }

    savedRecipesMessage.textContent = "";

    savedRecipesContainer.innerHTML = data.recipes
      .map((recipe) => createSavedRecipeCard(recipe))
      .join("");
  } catch (error) {
    console.error(error);
    savedRecipesMessage.textContent = "Error cargando recetas guardadas.";
  }
}

function createSavedRecipeCard(recipe) {
  return `
    <article class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.title}" />

      <div class="recipe-card-body">
        <h3 class="recipe-card-title">${recipe.title}</h3>

        <p class="recipe-card-text">
          Receta guardada en tus favoritos.
        </p>

        <div class="recipe-card-actions">
          <a href="/receta.html?id=${recipe.recipeId}" class="recipe-card-link">
            Ver receta
          </a>

          <button
            type="button"
            class="delete-saved-recipe-btn"
            data-id="${recipe.recipeId}"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  `;
}

document.addEventListener("click", async (event) => {
  const btn = event.target.closest(".delete-saved-recipe-btn");
  if (!btn) return;

  const token = localStorage.getItem("token");
  const recipeId = btn.dataset.id;

  try {
    const response = await fetch(`/api/saved-recipes/${recipeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("No se pudo eliminar la receta");
      return;
    }

    loadSavedRecipes();
  } catch (error) {
    console.error(error);
    alert("Error eliminando receta");
  }
});

loadSavedRecipes();