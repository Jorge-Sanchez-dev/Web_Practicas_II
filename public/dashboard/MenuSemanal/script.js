
  const weeklyCalendar = document.getElementById("weeklyCalendar");
  const weekRange = document.getElementById("weekRange");
  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");

  let currentDate = new Date();

  const mealsData = {
    0: { desayuno: "Tostadas con aguacate", comida: "Pasta con pollo", cena: "Ensalada César" },
    1: { desayuno: "Yogur con frutas", comida: "Arroz con verduras", cena: "Tortilla francesa" },
    2: { desayuno: "Avena con plátano", comida: "Lentejas", cena: "Salmón al horno" },
    3: { desayuno: "Batido de frutas", comida: "Pollo con patatas", cena: "Crema de calabacín" },
    4: { desayuno: "Tostadas y café", comida: "Paella", cena: "Wrap de pollo" },
    5: { desayuno: "Pancakes", comida: "Hamburguesa casera", cena: "Pizza casera" },
    6: { desayuno: "Croissant y zumo", comida: "Macarrones boloñesa", cena: "Sopa ligera" }
  };

  const dayNames = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  const monthNames = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // lunes como inicio
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatWeekRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = monthNames[startDate.getMonth()];
    const endMonth = monthNames[endDate.getMonth()];

    if (startMonth === endMonth) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function renderWeek() {
    weeklyCalendar.innerHTML = "";

    const startOfWeek = getStartOfWeek(currentDate);
    weekRange.textContent = formatWeekRange(startOfWeek);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);

      const dayMeals = mealsData[i] || {};

      const card = document.createElement("article");
      card.className = `day-card ${isToday(dayDate) ? "today" : ""}`;

      card.innerHTML = `
        <div class="day-header">
          <span class="day-name">${dayNames[i]}</span>
          <span class="day-date">${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}</span>
        </div>

        <div class="meal-block">
          <span class="meal-label">Desayuno</span>
          <div class="meal-value ${!dayMeals.desayuno ? "empty-meal" : ""}">
            ${dayMeals.desayuno || "Sin receta asignada"}
          </div>
        </div>

        <div class="meal-block">
          <span class="meal-label">Comida</span>
          <div class="meal-value ${!dayMeals.comida ? "empty-meal" : ""}">
            ${dayMeals.comida || "Sin receta asignada"}
          </div>
        </div>

        <div class="meal-block">
          <span class="meal-label">Cena</span>
          <div class="meal-value ${!dayMeals.cena ? "empty-meal" : ""}">
            ${dayMeals.cena || "Sin receta asignada"}
          </div>
        </div>
      `;

      weeklyCalendar.appendChild(card);
    }
  }

  prevWeekBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 7);
    renderWeek();
  });

  nextWeekBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 7);
    renderWeek();
  });

  renderWeek();
