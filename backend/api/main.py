from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, os, re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# -------------------------------
# Load dataset
# -------------------------------
RECIPES_PATH = os.environ.get("RECIPES_PATH", "recipes.json")

with open(RECIPES_PATH, "r", encoding="utf-8") as f:
    recipes = json.load(f)

# Give each recipe an id if missing
for i, r in enumerate(recipes):
    if "_id" not in r:
        r["_id"] = i

# Prepare dish names for TF-IDF search
dish_names = [r.get("dish_name", "") for r in recipes]
try:
    vectorizer = TfidfVectorizer().fit(dish_names)
    dish_vectors = vectorizer.transform(dish_names)
except Exception:
    vectorizer, dish_vectors = None, None

# -------------------------------
# Helpers for scaling
# -------------------------------
def detect_base_servings(recipe):
    for k in ("servings", "servings_scaled_to", "servings_original"):
        if k in recipe and recipe[k]:
            try:
                return float(recipe[k])
            except:
                pass
    return 2.0  # default

def scale_ingredients(ingredients, base, target):
    factor = target / base if base else 1
    scaled = []
    for ing in ingredients:
        name = ing.get("ingredient")
        qty = ing.get("quantity")
        unit = ing.get("unit")
        if isinstance(qty, (int, float)):
            scaled.append({
                "ingredient": name,
                "quantity": round(qty * factor, 2),
                "unit": unit
            })
        else:
            scaled.append({"ingredient": name, "quantity": qty, "unit": unit})
    return scaled

def adjust_instructions(instr, orig, scaled):
    if not instr:
        return instr
    text = instr
    for o, s in zip(orig, scaled):
        if o.get("quantity") and s.get("quantity"):
            try:
                oq = str(o["quantity"])
                sq = str(s["quantity"])
                if oq in text:
                    text = text.replace(oq, sq)
            except:
                continue
    return text

# -------------------------------
# FastAPI app
# -------------------------------
app = FastAPI(title="Recipe API", version="1.0")

# Allow your frontend origin
origins = [
    "http://localhost:3000",  # React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecipeRequest(BaseModel):
    recipe_id: Optional[int] = None
    query: Optional[str] = None
    people: Optional[float] = 2.0

class IngredientPredictRequest(BaseModel):
    ingredients: str
    servings: Optional[int] = 2
    cuisine: Optional[str] = ""
    dietaryRestrictions: Optional[list] = []

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

@app.get("/cuisines")
def get_cuisines() -> dict:
    cuisines = sorted({(r.get("cuisine") or "Unknown") for r in recipes})
    return {"cuisines": cuisines, "count": len(cuisines)}

@app.get("/dishes")
def get_dishes(cuisine: str, people: float = 4.0) -> dict:
    matches = [r.copy() for r in recipes if (r.get("cuisine") or "").lower() == cuisine.lower()]
    # Scale ingredients for each recipe to the requested people count
    for r in matches:
        base = detect_base_servings(r)
        r["ingredients_scaled"] = scale_ingredients(r.get("ingredients", []), base, people)
        r["servings_scaled_to"] = people
        
    return {"cuisine": cuisine, "count": len(matches), "dishes": matches}

@app.get("/search")
def search(query: str, limit: int = 8) -> dict:
    query_lower = query.strip().lower()
    suggestions = [
        r for r in recipes
        if query_lower in (r.get("dish_name", "") or "").lower()
    ]
    # Return full recipe objects so _id is available for /get_recipe
    return {
        "results": suggestions[:limit]
    }

@app.get("/recipe/{recipe_id}")
def get_recipe(recipe_id: int, people: float = 2.0) -> dict:
    r = next((x for x in recipes if x["_id"] == recipe_id), None)
    if not r:
        raise HTTPException(404, "Recipe not found")
    base = detect_base_servings(r)
    scaled = scale_ingredients(r.get("ingredients", []), base, people)
    instr = adjust_instructions(r.get("instructions",""), r.get("ingredients", []), scaled)
    return {
        "id": r["_id"],
        "dish_name": r.get("dish_name"),
        "cuisine": r.get("cuisine"),
        "type": r.get("type"),
        "time_to_prepare_minutes": r.get("time_to_prepare_minutes"),
        "servings": {"base": base, "scaled_to": people},
        "ingredients": scaled,
        "instructions": instr,
    }

@app.post("/get_recipe")
def post_get_recipe(req: RecipeRequest) -> dict:
    if req.recipe_id is not None:
        return get_recipe(req.recipe_id, req.people or 2.0)

    if req.query:
        result = search(req.query, limit=1)["results"]
        print("Search result:", result)  # 👈 ADD THIS LINE
        if result:
            rid = result[0].get("_id") or result[0].get("id") or result[0].get("recipe_id")
            if not rid:
                raise HTTPException(500, "Recipe ID not found in search result")
            return get_recipe(rid, req.people or 2.0)

    raise HTTPException(400, "Provide recipe_id or query")

@app.post("/api/ingredient-predict")
def ingredient_predict(req: IngredientPredictRequest) -> dict:
    # Filter recipes by cuisine if provided
    filtered = recipes
    if req.cuisine:
        filtered = [r for r in recipes if (r.get("cuisine") or "").lower() == req.cuisine.lower()]
    # Simple ingredient match (mock logic)
    ingredient_list = [i.strip().lower() for i in req.ingredients.split(",") if i.strip()]
    best_match = None
    best_score = 0
    for r in filtered:
        recipe_ings = [ing.get("ingredient", "").lower() for ing in r.get("ingredients", []) if isinstance(ing, dict)]
        score = sum(1 for i in ingredient_list if i in recipe_ings)
        if score > best_score:
            best_score = score
            best_match = r
    if not best_match and filtered:
        best_match = filtered[0]
    if not best_match:
        raise HTTPException(404, "No matching recipe found for cuisine")
    # Prepare response
    base_servings = detect_base_servings(best_match)
    scaled_ings = scale_ingredients(best_match.get("ingredients", []), base_servings, req.servings or 2)
    return {
        "type": "ingredient-prediction",
        "dishName": best_match.get("dish_name"),
        "cuisine": best_match.get("cuisine"),
        "targetServings": req.servings,
        "baseServings": base_servings,
        "ingredients": [
            {
                "name": ing.get("ingredient"),
                "baseAmount": ing.get("quantity"),
                "scaledAmount": scaled.get("quantity"),
                "unit": ing.get("unit"),
                "category": ing.get("category", ""),
                "confidence": 1.0  # mock
            }
            for ing, scaled in zip(best_match.get("ingredients", []), scaled_ings)
        ],
        "accuracy": 95,
        "scalingFactor": round((req.servings or 2) / base_servings, 2),
        "cookingTime": best_match.get("time_to_prepare_minutes", 30),
        "difficulty": best_match.get("difficulty", "Medium"),
        "tips": ["You can adjust spices as per your taste.", "Try adding fresh herbs for more flavor"]
    }
       
