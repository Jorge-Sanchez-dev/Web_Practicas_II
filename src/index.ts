import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SPOONACULAR_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/recipes", async (req, res) => {
  try {
    const query = req.query.query;
    const number = Number(req.query.number) || 39;

    let url = "";

    if (query) {
      url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        String(query)
      )}&number=${number}&apiKey=${API_KEY}`;
    } else {
      url = `https://api.spoonacular.com/recipes/random?number=${number}&apiKey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("DATA:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Error al obtener recetas desde Spoonacular",
      });
    }

    const recipes = query ? data.results : data.recipes;

    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        error: "La API no devolvió recetas en formato correcto",
      });
    }

    const formattedRecipes = recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    }));

    res.json({ results: formattedRecipes });
  } catch (error) {
    console.error("Error obteniendo recetas:", error);
    res.status(500).json({ error: "Error obteniendo recetas" });
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const ingredients =
      data.extendedIngredients?.map((ing: any) => ing.original) || [];

    const steps =
      data.analyzedInstructions?.[0]?.steps?.map(
        (step: any) => step.step
      ) || [];

    return res.json({
      id: data.id,
      title: data.title,
      image: data.image,
      ingredients,
      steps,
    });
  } catch (error) {
    console.error("Error en detalle receta:", error);
    res.status(500).json({ error: "Error obteniendo receta" });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});