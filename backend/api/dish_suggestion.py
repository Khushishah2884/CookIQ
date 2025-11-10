# dish_suggester_from_ingredients.py
"""
Standalone Dish Suggester
- Loads recipes from recipes.json (configure JSON_FILE)
- Prompts user to enter available ingredients (comma-separated)
- Finds best-matching recipes using normalized ingredient names
- Displays dish details (name, cuisine, type, time, ingredients, instructions)

This script is intentionally standalone (no scaling or instruction-adjustment code).
"""

import os
import json
import re
import difflib
from typing import Set, List, Dict, Tuple

# --- configure this path to your JSON file ---
JSON_FILE = r"D:\CookIQ\backend\api\recipes.json"
# --------------------------------------------

if not os.path.exists(JSON_FILE):
    raise FileNotFoundError(f"JSON file not found at {JSON_FILE}")

with open(JSON_FILE, "r", encoding="utf-8") as fh:
    RECIPES = json.load(fh)

# common unit and junk words to strip from ingredient names
UNIT_WORDS = [
    "teaspoon",
    "tsp",
    "tablespoon",
    "tbsp",
    "cup",
    "cups",
    "gram",
    "grams",
    "g",
    "kg",
    "kilogram",
    "ml",
    "milliliter",
    "l",
    "liter",
    "piece",
    "pieces",
    "clove",
    "pinch",
    "to",
    "taste",
    "of",
    "and",
    "fresh",
]
UNIT_RE = r"\b(?:%s)\b" % "|".join([re.escape(w) for w in UNIT_WORDS])


def normalize_ingredient_text(s: str) -> str:
    """Return a normalized, lowercased ingredient name with quantities/units removed."""
    if not s:
        return ""
    t = str(s).lower()
    # remove parentheses and their contents
    t = re.sub(r"\([^)]*\)", " ", t)
    # remove numeric tokens, fractions like 1/2, 1 1/2, decimals
    t = re.sub(r"\d+[\d\s/\.]*", " ", t)
    # remove unit words
    t = re.sub(UNIT_RE, " ", t)
    # remove punctuation
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    # collapse whitespace
    t = re.sub(r"\s+", " ", t).strip()
    return t


def extract_recipe_ingredient_names(recipe: Dict) -> Set[str]:
    """Return normalized set of ingredient names for the given recipe dict."""
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


# Precompute normalized ingredient sets for all recipes
RECIPE_ING_INDEX: List[Tuple[int, Set[str]]] = [
    (i, extract_recipe_ingredient_names(r)) for i, r in enumerate(RECIPES)
]


def parse_user_ingredients(text: str) -> Set[str]:
    parts = re.split(r"[,;\n]+", text)
    items = [p.strip() for p in parts if p.strip()]
    norm = set()
    for it in items:
        n = normalize_ingredient_text(it)
        if n:
            norm.add(n)
    return norm


def match_score_and_details(
    user_set: Set[str], recipe_set: Set[str]
) -> Tuple[float, List[str], List[str]]:
    """Return (score, matched_list, missing_list).
    Score = matched_count / total_recipe_ingredients (float in [0,1]).
    Matching uses exact normalized matches, substring matches and fuzzy closeness.
    """
    exact = {r for r in recipe_set if r in user_set}

    substr = set()
    for r in recipe_set:
        for u in user_set:
            if u in r or r in u:
                substr.add(r)

    fuzzy = set()
    for r in recipe_set:
        for u in user_set:
            # attempt close match between tokens
            choices = difflib.get_close_matches(u, [r], n=1, cutoff=0.78)
            if choices:
                fuzzy.add(r)

    matched = exact.union(substr).union(fuzzy)
    matched_count = len(matched)
    total = max(1, len(recipe_set))
    score = matched_count / total
    missing = sorted(list(recipe_set - matched))
    matched_list = sorted(list(matched))
    return score, matched_list, missing


def suggest_dishes_by_ingredients(
    user_text: str, top_n: int = 8
):
    user_set = parse_user_ingredients(user_text)
    if not user_set:
        return []
    results = []
    for idx, recipe_set in RECIPE_ING_INDEX:
        # Only consider recipes that contain ALL user ingredients
        if all(any(u in r or r in u or difflib.get_close_matches(u, [r], n=1, cutoff=0.78) for r in recipe_set) for u in user_set):
            score, matched_list, missing = match_score_and_details(user_set, recipe_set)
            results.append(
                {
                    "index": idx,
                    "score": score,
                    "matched": matched_list,
                    "missing": missing,
                    "total_recipe_ings": len(recipe_set),
                }
            )
    results.sort(key=lambda x: (-x["score"], len(x["missing"])))
    return results[:top_n]


def print_recipe_brief(recipe: Dict, details: Dict):
    print(f"\n{recipe.get('dish_name') or recipe.get('title','Unnamed')}")
    print(
        f"Cuisine: {recipe.get('cuisine','?')} | Type: {recipe.get('type','?')} | Time: {recipe.get('time_to_prepare_minutes','?')} mins"
    )
    print(
        f"Match: {details['score']*100:.0f}%  (matched {len(details['matched'])}/{details['total_recipe_ings']})"
    )
    if details["matched"]:
        print("  Matched:", ", ".join(details["matched"]))
    if details["missing"]:
        print("  Missing:", ", ".join(details["missing"]))


def try_parse_float(val):
    """Try to parse a value as float, else return None."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def print_recipe_full(recipe: Dict, scale: float = 1.0):
    print("\n" + "=" * 50)
    print(f"DISH: {recipe.get('dish_name') or recipe.get('title','Unnamed')}")
    print(f"Cuisine: {recipe.get('cuisine','?')}")
    print(f"Type: {recipe.get('type','?')}")
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
                    # Show as int if possible, else 2 decimals
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


def interactive_loop():
    print(
        "Standalone Dish Suggester — enter your available ingredients and get matching recipes."
    )
    while True:
        text = input(
            "\nEnter available ingredients (comma separated) or Q to quit:\n> "
        ).strip()
        if not text:
            continue
        if text.lower() in ("q", "quit", "exit"):
            print("Goodbye")
            break
        suggestions = suggest_dishes_by_ingredients(text, top_n=10)
        if not suggestions:
            print("Not in our knowledge.")
            continue
        print(f"\nFound {len(suggestions)} candidate recipes:")
        for i, s in enumerate(suggestions, 1):
            recipe = RECIPES[s["index"]]
            print(
                f"{i}.",
                recipe.get("dish_name") or recipe.get("title", "Unnamed"),
                f"- {s['score']*100:.0f}%"
            )
        # allow user to view full recipe
        try:
            sel = input(
                "\nSelect a recipe number to view details, A to view all briefs, or press Enter to search again: "
            ).strip()
            if not sel:
                continue
            if sel.lower() == "a":
                for s in suggestions:
                    print_recipe_brief(RECIPES[s["index"]], s)
                continue
            sel_i = int(sel)
            if 1 <= sel_i <= len(suggestions):
                # Ask for number of people only when viewing a recipe
                while True:
                    num_input = input("How many people do you want to serve? (default 1): ").strip()
                    if not num_input:
                        num_people = 1
                        break
                    try:
                        num_people = int(num_input)
                        if num_people < 1:
                            print("Please enter a positive integer.")
                            continue
                        break
                    except ValueError:
                        print("Invalid input. Please enter a number.")
                chosen = RECIPES[suggestions[sel_i - 1]["index"]]
                print_recipe_full(chosen, scale=num_people)
            else:
                print("Invalid selection")
        except Exception as e:
            print("Invalid input, try again.")


if __name__ == "__main__":
    interactive_loop()
   
