function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchRecipeDetail(id) {
  const container = document.getElementById("recipeContainer");
  const message = document.getElementById("recipeMessage");

  if (!id) {
    message.textContent = "No se ha encontrado la receta.";
    return;
  }

  message.textContent = "Cargando receta...";

  try {
    const response = await fetch(`/api/recipes/${id}`);

    if (!response.ok) {
      throw new Error("Error al obtener la receta");
    }

    const recipe = await response.json();

    message.textContent = "";

    container.innerHTML = `
      <h1 class="recipe-title">${recipe.title}</h1>

      <img class="recipe-image" src="${recipe.image}" />

      <div class="recipe-section">
        <h3>Ingredientes</h3>
        <ul class="recipe-list">
          ${recipe.ingredients
            .map((ing) => `<li>${ing}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="recipe-section">
        <h3>Preparación</h3>
        <div class="recipe-steps">
          ${recipe.steps
            .map((step) => `<div class="recipe-step">${step}</div>`)
            .join("")}
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    message.textContent = "Error al cargar la receta.";
  }
}

function initRecipePage() {
  const id = getRecipeIdFromUrl();
  fetchRecipeDetail(id);
}

initRecipePage();