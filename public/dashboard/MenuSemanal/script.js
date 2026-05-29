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
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
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
    weeklyCalendar.innerHTML =
      "<p>Debes iniciar sesión para ver tu menú semanal.</p>";
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

    if (!response.ok) {
  console.error("Error backend:", data);
  throw new Error(data.error || "Error cargando menú semanal");
}

    weeklyMeals = data.meals || [];

    renderWeek();
  } catch (error) {
    console.error(error);
    weeklyCalendar.innerHTML = "<p>Error cargando el menú semanal.</p>";
  }
}

function getMeal(day, mealType) {
  return weeklyMeals.find(
    (meal) => meal.day === day && meal.mealType === mealType
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

    mealTypes.forEach((mealType) => {
      const meal = getMeal(day, mealType);

      mealsHTML += `
        <div class="meal-block">
          <span class="meal-label">${mealType}</span>

          <div class="meal-value ${!meal ? "empty-meal" : ""}">
            ${meal ? meal.title : "Sin receta asignada"}
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="day-header">
        <span class="day-name">${dayLabels[i]}</span>
        <span class="day-date">
          ${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}
        </span>
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