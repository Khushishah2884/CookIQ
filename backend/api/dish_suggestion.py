# dish_suggester_from_ingredients_ML.py
"""
ML-based Dish Suggester (TF-IDF + Cosine Similarity + K-Means Clustering)
-------------------------------------------------------------------------
- Loads recipes from recipes.json
- Uses Machine Learning (TF-IDF) for similarity
- Applies K-Means clustering to group similar recipes
- Suggests best-matching dishes based on entered ingredients
- Displays name, cuisine, type, time, ingredients, and instructions
"""

import os
import json
import re
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from collections import defaultdict

# --- configure this path to your JSON file ---
JSON_FILE = r"D:/PROJECTS/CookIQ/backend/api/recipes.json"
# ---------------------------------------------

if not os.path.exists(JSON_FILE):
    raise FileNotFoundError(f"JSON file not found at {JSON_FILE}")

with open(JSON_FILE, "r", encoding="utf-8") as fh:
    RECIPES = json.load(fh)

# Common junk/unit words to remove for cleaner ingredient matching
UNIT_WORDS = [
    "teaspoon","tsp","tablespoon","tbsp","cup","cups","gram","grams","g","kg",
    "kilogram","ml","milliliter","l","liter","piece","pieces","clove","pinch",
    "to","taste","of","and","fresh"
]
UNIT_RE = r"\b(?:%s)\b" % "|".join([re.escape(w) for w in UNIT_WORDS])


# ------------------------------------------------------------------
# Text Normalization
# ------------------------------------------------------------------
def normalize_ingredient_text(s: str) -> str:
    """Clean and normalize ingredient text."""
    if not s:
        return ""
    t = str(s).lower()
    t = re.sub(r"\([^)]*\)", " ", t)           # remove parentheses
    t = re.sub(r"\d+[\d\s/\.]*", " ", t)       # remove numbers
    t = re.sub(UNIT_RE, " ", t)                # remove unit words
    t = re.sub(r"[^a-z0-9\s]", " ", t)         # remove punctuation
    t = re.sub(r"\s+", " ", t).strip()         # collapse spaces
    return t


def extract_recipe_ingredient_names(recipe: Dict) -> List[str]:
    """Return list of normalized ingredient names for a given recipe."""
    out = []
    for ing in recipe.get("ingredients", []):
        if isinstance(ing, dict):
            name = ing.get("ingredient") or ing.get("name") or ""
        else:
            name = str(ing)
        n = normalize_ingredient_text(name)
        if n:
            out.append(n)
    return out


def parse_user_ingredients(text: str) -> str:
    """Normalize user-entered ingredient text."""
    parts = re.split(r"[,;\n]+", text)
    items = [p.strip() for p in parts if p.strip()]
    norm = [normalize_ingredient_text(it) for it in items if it]
    return " ".join(norm)


# ------------------------------------------------------------------
# Build the TF-IDF Model
# ------------------------------------------------------------------
print("Building TF-IDF model from recipes...")

recipe_texts = [
    " ".join(extract_recipe_ingredient_names(r))
    for r in RECIPES
]

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(recipe_texts)

print(f"Loaded {len(RECIPES)} recipes and built TF-IDF model successfully.")


# ------------------------------------------------------------------
# K-Means Clustering on Recipes
# ------------------------------------------------------------------
print("Applying K-Means clustering to group similar recipes...")

NUM_CLUSTERS = 6  # adjust this based on your dataset size
kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=42)
cluster_labels = kmeans.fit_predict(tfidf_matrix)

# Assign each recipe to a cluster
for i, recipe in enumerate(RECIPES):
    recipe["cluster"] = int(cluster_labels[i])

print(f"Recipes successfully grouped into {NUM_CLUSTERS} clusters.\n")

# Optional: display cluster summary
clusters = defaultdict(list)
for r in RECIPES:
    clusters[r["cluster"]].append(r.get("dish_name", "Unnamed"))

print("Cluster Overview (sample dishes per cluster):")
for cid, dishes in clusters.items():
    print(f"  Cluster {cid + 1}: {', '.join(dishes[:5])}")
print("\n")


# ------------------------------------------------------------------
# Suggestion Logic
# ------------------------------------------------------------------
def suggest_dishes_by_ingredients(user_text: str, top_n: int = 8):
    user_norm = parse_user_ingredients(user_text)
    if not user_norm:
        return []
    user_vec = vectorizer.transform([user_norm])
    sims = cosine_similarity(user_vec, tfidf_matrix).flatten()
    top_idx = sims.argsort()[::-1][:top_n]
    results = []
    for i in top_idx:
        if sims[i] > 0:
            results.append({
                "index": i,
                "score": float(sims[i]),
                "cluster": int(RECIPES[i]["cluster"])
            })
    return results


# ------------------------------------------------------------------
# Display Helpers
# ------------------------------------------------------------------
def try_parse_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def print_recipe_full(recipe: Dict, scale: float = 1.0):
    print("\n" + "=" * 50)
    print(f"DISH: {recipe.get('dish_name') or recipe.get('title','Unnamed')}")
    print(f"Cuisine: {recipe.get('cuisine','?')}")
    print(f"Type: {recipe.get('type','?')}")
    print(f"Cluster Group: {recipe.get('cluster','?')}")
    print(f"Time to prepare (mins): {recipe.get('time_to_prepare_minutes','?')}")
    print("\nINGREDIENTS:")
    for ing in recipe.get("ingredients", []):
        if isinstance(ing, dict):
            q = ing.get("quantity")
            u = ing.get("unit") or ""
            name = ing.get("ingredient") or ing.get("name") or ""
            if q is not None:
                qf = try_parse_float(q)
                if qf is not None:
                    scaled_q = qf * scale
                    if scaled_q.is_integer():
                        scaled_q_str = str(int(scaled_q))
                    else:
                        scaled_q_str = f"{scaled_q:.2f}"
                    print(f" - {scaled_q_str} {u} {name}")
                else:
                    print(f" - {q} {u} {name}")
            else:
                print(f" - {name}")
        else:
            print(f" - {ing}")
    print("\nINSTRUCTIONS:\n")
    print(recipe.get("instructions", "No instructions available"))
    print("\n" + "=" * 50)


# ------------------------------------------------------------------
# Interactive Loop
# ------------------------------------------------------------------
def interactive_loop():
    print("\nML-based Dish Suggester — enter your available ingredients.")
    while True:
        text = input("\nEnter available ingredients (comma separated) or Q to quit:\n> ").strip()
        if not text:
            continue
        if text.lower() in ("q", "quit", "exit"):
            print("Goodbye!")
            break

        suggestions = suggest_dishes_by_ingredients(text, top_n=10)
        if not suggestions:
            print("No matching recipes found.")
            continue

        print(f"\nTop {len(suggestions)} matching recipes:")
        for i, s in enumerate(suggestions, 1):
            recipe = RECIPES[s["index"]]
            print(f"{i}. {recipe.get('dish_name') or recipe.get('title','Unnamed')}  "
                  f"({s['score']*100:.1f}% similarity, Cluster {s['cluster']})")

        sel = input("\nEnter recipe number to view details or press Enter to search again: ").strip()
        if not sel:
            continue
        try:
            sel_i = int(sel)
            if 1 <= sel_i <= len(suggestions):
                chosen = RECIPES[suggestions[sel_i - 1]["index"]]
                while True:
                    num_input = input("How many people to serve? (default 1): ").strip()
                    if not num_input:
                        num_people = 1
                        break
                    try:
                        num_people = int(num_input)
                        if num_people < 1:
                            print("Please enter a positive number.")
                            continue
                        break
                    except ValueError:
                        print("Invalid input, try again.")
                print_recipe_full(chosen, scale=num_people)
        except Exception:
            print("Invalid input, try again.")


if __name__ == "__main__":
    interactive_loop()