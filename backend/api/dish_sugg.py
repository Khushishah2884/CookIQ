# fastapi_backend/main.py
from fastapi import APIRouter
router = APIRouter(prefix="/ingredients", tags=["Ingredients"])

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os, json, re, difflib

# ------------------ CONFIG ------------------
JSON_FILE = r"D:\CookIQ\backend\api\recipes.json"
if not os.path.exists(JSON_FILE):
    raise FileNotFoundError(f"JSON file not found at {JSON_FILE}")

with open(JSON_FILE, "r", encoding="utf-8") as fh:
    RECIPES = json.load(fh)

UNIT_WORDS = [
    "teaspoon", "tsp", "tablespoon", "tbsp", "cup", "cups", "gram", "grams",
    "g", "kg", "kilogram", "ml", "milliliter", "l", "liter", "piece", "pieces",
    "clove", "pinch", "to", "taste", "of", "and", "fresh",
]
UNIT_RE = r"\b(?:%s)\b" % "|".join([re.escape(w) for w in UNIT_WORDS])

# ------------------ HELPER FUNCTIONS ------------------

def normalize_ingredient_text(s: str) -> str:
    if not s:
        return ""
    t = str(s).lower()
    t = re.sub(r"\([^)]*\)", " ", t)
    t = re.sub(r"\d+[\d\s/\.]*", " ", t)
    t = re.sub(UNIT_RE, " ", t)
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def extract_recipe_ingredient_names(recipe) -> set:
    out = set()
    for ing in recipe.get("ingredients", []):
        if isinstance(ing, dict):
            name = ing.get("ingredient") or ing.get("name") or ""
        else:
            name = str(ing)
        n = normalize_ingredient_text(name)
        if n:
            out.add(n)
    return out

RECIPE_ING_INDEX = [
    (i, extract_recipe_ingredient_names(r)) for i, r in enumerate(RECIPES)
]

def parse_user_ingredients(text: str) -> set:
    parts = re.split(r"[,;\n]+", text)
    items = [p.strip() for p in parts if p.strip()]
    return {normalize_ingredient_text(it) for it in items if normalize_ingredient_text(it)}

def match_score_and_details(user_set: set, recipe_set: set):
    exact = {r for r in recipe_set if r in user_set}
    substr = {r for r in recipe_set for u in user_set if u in r or r in u}
    fuzzy = {r for r in recipe_set for u in user_set if difflib.get_close_matches(u, [r], n=1, cutoff=0.78)}
    matched = exact.union(substr).union(fuzzy)
    matched_count = len(matched)
    total = max(1, len(recipe_set))
    score = matched_count / total
    missing = sorted(list(recipe_set - matched))
    matched_list = sorted(list(matched))
    return score, matched_list, missing

def try_parse_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return None

# ------------------ FASTAPI SETUP ------------------

#app = FastAPI(title="Dish Suggester API")

class SuggestRequest(BaseModel):
    ingredients: str
    top_n: Optional[int] = 8

class RecipeFullRequest(BaseModel):
    num_people: Optional[int] = 1

# ------------------ ENDPOINTS ------------------

@router.post("/suggest_recipes")
def suggest_recipes(req: SuggestRequest):
    user_set = parse_user_ingredients(req.ingredients)
    if not user_set:
        raise HTTPException(status_code=400, detail="No valid ingredients provided.")

    results = []
    for idx, recipe_set in RECIPE_ING_INDEX:
        if all(any(u in r or r in u or difflib.get_close_matches(u, [r], n=1, cutoff=0.78) for r in recipe_set) for u in user_set):
            score, matched, missing = match_score_and_details(user_set, recipe_set)
            results.append({
                "index": idx,
                "dish_name": RECIPES[idx].get("dish_name") or RECIPES[idx].get("title","Unnamed"),
                "cuisine": RECIPES[idx].get("cuisine","?"),
                "type": RECIPES[idx].get("type","?"),
                "time_to_prepare_minutes": RECIPES[idx].get("time_to_prepare_minutes","?"),
                "score": round(score, 2),
                "matched": matched,
                "missing": missing,
                "total_recipe_ings": len(recipe_set),
            })
    results.sort(key=lambda x: (-x["score"], len(x["missing"])))
    return results[:req.top_n]

@router.post("/recipe_full/{recipe_id}")
def recipe_full(recipe_id: int, req: RecipeFullRequest):
    if not (0 <= recipe_id < len(RECIPES)):
        raise HTTPException(status_code=404, detail="Recipe not found.")
    
    recipe = RECIPES[recipe_id]
    scale = req.num_people or 1
    ingredients_list = []
    for ing in recipe.get("ingredients", []):
        if isinstance(ing, dict):
            q = ing.get("quantity")
            u = ing.get("unit") or ""
            name = ing.get("ingredient") or ing.get("name") or ""
            if q is not None:
                qf = try_parse_float(q)
                if qf is not None:
                    scaled_q = qf * scale
                    scaled_q_str = str(int(scaled_q)) if scaled_q.is_integer() else f"{scaled_q:.2f}"
                    ingredients_list.append(f"{scaled_q_str} {u} {name}".strip())
                else:
                    ingredients_list.append(f"{q} {u} {name}".strip())
            else:
                ingredients_list.append(name)
        else:
            ingredients_list.append(str(ing))
    
    return {
        "dish_name": recipe.get("dish_name") or recipe.get("title","Unnamed"),
        "cuisine": recipe.get("cuisine","?"),
        "type": recipe.get("type","?"),
        "time_to_prepare_minutes": recipe.get("time_to_prepare_minutes","?"),
        "ingredients": ingredients_list,
        "instructions": recipe.get("instructions","No instructions available"),
    }
