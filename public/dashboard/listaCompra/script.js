const shoppingListContainer = document.getElementById("shoppingListContainer");
const searchIngredient = document.getElementById("searchIngredient");

let shoppingItems = [];

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

async function loadShoppingList() {
  const token = getToken();

  if (!token) {
    shoppingListContainer.innerHTML = `
      <div class="shopping-empty">
        Debes iniciar sesión para ver tu lista de la compra.
      </div>
    `;
    return;
  }

  const currentWeekStart = formatDateForAPI(getStartOfWeek(new Date()));

  try {
    const response = await fetch(`/api/shopping-list?weekStart=${currentWeekStart}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error cargando lista");
    }

    shoppingItems = data.items || [];
    renderShoppingList(shoppingItems);
  } catch (error) {
    console.error(error);
    shoppingListContainer.innerHTML = `
      <div class="shopping-empty">
        Error cargando la lista de la compra.
      </div>
    `;
  }
}

function renderShoppingList(items) {
  shoppingListContainer.innerHTML = "";

  if (items.length === 0) {
    shoppingListContainer.innerHTML = `
      <div class="shopping-empty">
        No tienes recetas añadidas al menú de esta semana.
      </div>
    `;
    return;
  }

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `shopping-item ${item.checked ? "checked" : ""}`;

    div.innerHTML = `
      <label class="shopping-product">
        <input type="checkbox" ${item.checked ? "checked" : ""} data-index="${index}" />
        <span>${item.name}</span>
      </label>

      <span class="shopping-qty">${item.quantity || "-"}</span>

      <span class="shopping-status ${item.checked ? "bought" : "pending"}">
        ${item.checked ? "Comprado" : "Pendiente"}
      </span>
    `;

    shoppingListContainer.appendChild(div);
  });
}

shoppingListContainer.addEventListener("change", (event) => {
  const checkbox = event.target.closest("input[type='checkbox']");
  if (!checkbox) return;

  const index = Number(checkbox.dataset.index);
  shoppingItems[index].checked = checkbox.checked;

  renderShoppingList(shoppingItems);
});

searchIngredient.addEventListener("input", () => {
  const value = searchIngredient.value.toLowerCase();

  const filteredItems = shoppingItems.filter((item) =>
    item.name.toLowerCase().includes(value)
  );

  renderShoppingList(filteredItems);
});

loadShoppingList();