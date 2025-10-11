# recipe_finder_with_scaling_and_instruction_adjust.py
import os
import json
import re
from math import floor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ----- configure this path to your JSON file -----
JSON_FILE = r"D:/PROJECTS/CookIQ/backend/api/recipes.json"
# -------------------------------------------------

if not os.path.exists(JSON_FILE):
    raise FileNotFoundError(f"JSON file not found at {JSON_FILE}")

with open(JSON_FILE, "r", encoding="utf-8") as fh:
    recipes = json.load(fh)

# Prepare TF-IDF on dish names (safe fallback if names are missing)
doc_texts = []
display_names = []
for i, r in enumerate(recipes):
    dn = (r.get("dish_name") or r.get("title") or "").strip()
    if not dn:
        # fallback: join first few ingredient names
        ing_names = []
        for ing in r.get("ingredients", [])[:4]:
            if isinstance(ing, dict):
                n = ing.get("ingredient") or ing.get("name")
            else:
                n = str(ing)
            if n:
                ing_names.append(n)
        dn = " ".join(ing_names) if ing_names else f"UnnamedRecipe{i}"
    doc_texts.append(dn)
    display_names.append(dn)

# Build TF-IDF vectorizer but handle possible ValueError
vectorizer = None
dish_vectors = None
try:
    vectorizer = TfidfVectorizer().fit(doc_texts)
    dish_vectors = vectorizer.transform(doc_texts)
except ValueError:
    vectorizer = None
    dish_vectors = None
    print(
        "Warning: TF-IDF failed to build a vocabulary. Only substring search will be used."
    )


# ----- helpers for servings detection and rounding -----
def detect_base_servings(recipe):
    for k in (
        "servings_scaled_to",
        "servings_original_detected",
        "servings",
        "servings_original",
    ):
        v = recipe.get(k)
        if v:
            try:
                return float(v)
            except:
                pass
    # fallback: assume 2 (safe default)
    return 2.0


def round_qty(q, unit):
    try:
        qf = float(q)
    except:
        return q
    u = (unit or "").lower()
    if u in ["grams", "gram", "g", "ml", "milliliter", "millilitre"]:
        return max(1, round(qf))
    elif u in ["liter", "l"]:
        return round(qf, 2)
    elif u in ["teaspoon", "tsp", "tablespoon", "tbsp", "cup"]:
        # quarter increments
        return max(0.25, round(qf * 4) / 4.0)
    elif u in ["piece", "clove", "pcs"]:
        return max(0.5, round(qf * 2) / 2.0)
    elif u in ["pinch"]:
        return max(0.25, round(qf * 4) / 4.0)
    else:
        return round(qf, 2)


# convert decimal quantity to readable mixed-fraction when denominator friendly
def format_qty_to_str(q, unit):
    """
    Format q according to unit for nice display:
      - grams/ml -> integer string
      - tsp/tbsp/cup -> mixed fraction with denominator 4 (quarters)
      - piece/clove -> halves
      - fallback -> 2-decimal string (or integer if whole)
    """
    try:
        qf = float(q)
    except:
        return str(q)

    u = (unit or "").lower()
    if u in ["grams", "gram", "g", "ml", "milliliter", "millilitre"]:
        return str(int(round(qf)))
    if u in ["teaspoon", "tsp", "tablespoon", "tbsp", "cup"]:
        # mixed fraction with denominator 4
        num = int(round(qf * 4))
        whole = num // 4
        rem = num % 4
        if rem == 0:
            return str(whole)
        # create reduced fraction
        from math import gcd

        den = 4
        g = gcd(rem, den)
        rem_r = rem // g
        den_r = den // g
        if whole == 0:
            return f"{rem_r}/{den_r}"
        return f"{whole} {rem_r}/{den_r}"
    if u in ["piece", "clove", "pcs"]:
        # halves
        num = int(round(qf * 2))
        whole = num // 2
        rem = num % 2
        if rem == 0:
            return str(whole)
        return f"{whole} 1/2" if whole > 0 else "1/2"
    # fallback default formatted with up to 2 decimals
    if abs(qf - round(qf)) < 1e-9:
        return str(int(round(qf)))
    return ("{:.2f}".format(qf)).rstrip("0").rstrip(".")


# ----- scale ingredients -----
def scale_ingredients(ingredients, base_servings, target_servings):
    if base_servings is None or base_servings == 0:
        factor = 1.0
    else:
        factor = float(target_servings) / float(base_servings)
    out = []
    for ing in ingredients:
        if not isinstance(ing, dict):
            name = str(ing)
            qty = None
            unit = None
        else:
            name = ing.get("ingredient") or ing.get("name") or ""
            qty = ing.get("quantity")
            unit = ing.get("unit") or ""
        if isinstance(qty, (int, float)):
            s = qty * factor
            s = round_qty(s, unit)
            out.append({"ingredient": name, "quantity": s, "unit": unit})
        elif isinstance(qty, str) and qty.strip():
            # try to parse numeric inside the string; else preserve as-is
            m = re.search(r"(\d+\s*\d?/\d+|\d+(\.\d+)?)", qty)
            if m:
                try:
                    val = float(m.group(1))
                    s = round_qty(val * factor, unit)
                    out.append({"ingredient": name, "quantity": s, "unit": unit})
                except:
                    out.append({"ingredient": name, "quantity": None, "unit": None})
            else:
                out.append({"ingredient": name, "quantity": None, "unit": None})
        else:
            out.append({"ingredient": name, "quantity": None, "unit": None})
    return out


# ----- instruction quantity adjuster (best-effort) -----
COMMON_UNITS = [
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
    "liter",
    "l",
    "piece",
    "pieces",
    "clove",
    "pinch",
]
unit_pattern = r"(?:%s)" % "|".join([re.escape(u) for u in COMMON_UNITS])


def adjust_instruction_quantities(instruction, original_ings, scaled_ings):
    """
    Best-effort: find numeric tokens near ingredient mentions and replace numeric token
    with scaled value (formatted). Operates with regex patterns before/after the ingredient name.
    """
    if not instruction or not isinstance(instruction, str):
        return instruction

    instr = instruction  # will build progressively

    # Build mapping by normalized name -> (orig_qty, orig_unit, scaled_qty, scaled_unit)
    def norm_name(n):
        return re.sub(r"[^a-z0-9\s]", "", (n or "").lower()).strip()

    orig_map = {}
    scaled_map = {}
    for o in original_ings:
        name = o.get("ingredient") if isinstance(o, dict) else str(o)
        key = norm_name(name)
        orig_map[key] = {
            "name": name,
            "qty": o.get("quantity"),
            "unit": (o.get("unit") or ""),
        }
    for s in scaled_ings:
        name = s.get("ingredient") if isinstance(s, dict) else str(s)
        key = norm_name(name)
        scaled_map[key] = {
            "name": name,
            "qty": s.get("quantity"),
            "unit": (s.get("unit") or ""),
        }

    # For each ingredient (keys), attempt two regex replacements:
    # 1) number + [unit]? + of? + ingredient_name  (e.g., "2 cups of rice")
    # 2) ingredient_name + [ - ]? + number + [unit]?  (e.g., "rice 2 cups")
    for key, oinfo in orig_map.items():
        if key == "":
            continue
        sinfo = scaled_map.get(key)
        if not sinfo:
            # Try partial match: match last word token
            last_token = key.split()[-1]
            sinfo = None
            for cand in scaled_map:
                if cand.endswith(last_token):
                    sinfo = scaled_map[cand]
                    break
            if not sinfo:
                continue

        orig_qty = oinfo.get("qty")
        orig_unit = oinfo.get("unit") or sinfo.get("unit") or ""
        scaled_qty = sinfo.get("qty")
        scaled_unit = sinfo.get("unit") or orig_unit

        # only adjust if we have a numeric origin and a numeric scaled
        try:
            if orig_qty is None or scaled_qty is None:
                continue
            float(orig_qty)
            float(scaled_qty)
        except:
            continue

        # prepare patterns using the actual ingredient name (escape)
        ingredient_pattern = re.escape(oinfo["name"])
        # also try matching on the normalized short form (last token) for safety
        short_name = re.escape((oinfo["name"].split()[-1]) if oinfo["name"] else "")

        # Pattern A: number (optionally fraction) + optional unit + optional 'of' + ingredient
        pA = re.compile(
            r"(?P<num>\d+\s*\d?/\d+|\d+(\.\d+)?)(?P<unit>\s*(%s)\b)?\s*(?:of\s+)?(?P<name>%s)"
            % (unit_pattern, r"(?:" + ingredient_pattern + r"|" + short_name + r")"),
            flags=re.IGNORECASE,
        )
        # Pattern B: ingredient + optional punctuation + number + optional unit
        pB = re.compile(
            r"(?P<name>%s)\s*(?:[:\-]|\s)?\s*(?P<num>\d+\s*\d?/\d+|\d+(\.\d+)?)(?P<unit>\s*(%s)\b)?"
            % (r"(?:" + ingredient_pattern + r"|" + short_name + r")", unit_pattern),
            flags=re.IGNORECASE,
        )

        def replA(m):
            newnum = format_qty_to_str(scaled_qty, scaled_unit)
            unit_text = m.group("unit") or (" " + scaled_unit if scaled_unit else "")
            # ensure spacing: return "<newnum><unit> <name>"
            return f"{newnum}{unit_text} {m.group('name')}"

        def replB(m):
            newnum = format_qty_to_str(scaled_qty, scaled_unit)
            unit_text = m.group("unit") or (" " + scaled_unit if scaled_unit else "")
            # return "<name> <newnum><unit>"
            return f"{m.group('name')} {newnum}{unit_text}"

        # Apply replacements (first pattern A, then B)
        instr_new = pA.sub(replA, instr)
        instr_new = pB.sub(replB, instr_new)
        instr = instr_new

    return instr


# ----- search helpers -----
def substring_search(query):
    q = query.strip().lower()
    matches = []
    for i, text in enumerate(doc_texts):
        if q in text.lower():
            matches.append((i, text))
    return matches


def tfidf_top_matches(query, top_n=5):
    if vectorizer is None:
        return []
    qv = vectorizer.transform([query])
    sim = cosine_similarity(qv, dish_vectors).flatten()
    idxs = sim.argsort()[::-1][:top_n]
    return [(i, recipes[i], sim[i]) for i in idxs]


# ----- UI flow: search by cuisine or by dish -----
def run_interactive():
    print("Search options:")
    print("1) Search by cuisine")
    print("2) Search by dish name")
    choice = input("Choose 1 or 2: ").strip()
    chosen_recipe = None

    if choice == "1":
        cuisine_q = (
            input("Enter cuisine (e.g., Gujarati, Indori, Punjabi): ").strip().lower()
        )
        matches = [
            (i, r)
            for i, r in enumerate(recipes)
            if (r.get("cuisine", "") or "").strip().lower() == cuisine_q
        ]
        if not matches:
            # try fuzzy substring on cuisine
            matches = [
                (i, r)
                for i, r in enumerate(recipes)
                if cuisine_q in ((r.get("cuisine", "") or "").lower())
            ]
        if not matches:
            print("No dishes found for that cuisine.")
            return
        print(f"Found {len(matches)} dishes in cuisine '{cuisine_q}':")
        for idx, (i, r) in enumerate(matches, 1):
            print(f"{idx}. {r.get('dish_name') or r.get('title') or 'Unnamed'}")
        try:
            sel = int(input(f"Select dish 1-{len(matches)}: ").strip() or "1")
            chosen_recipe = matches[sel - 1][1]
        except:
            chosen_recipe = matches[0][1]

    elif choice == "2":
        q = input("Enter dish name or part of it: ").strip()
        # substring first
        subs = substring_search(q)
        if subs:
            print(f"Substring matches ({len(subs)}):")
            limit = min(10, len(subs))
            for idx, (i, txt) in enumerate(subs[:limit], 1):
                print(f"{idx}. {recipes[i].get('dish_name') or txt}")
            try:
                sel = int(
                    input(f"Select 1-{limit} or press Enter for 1: ").strip() or "1"
                )
                idx_selected = subs[sel - 1][0]
                chosen_recipe = recipes[idx_selected]
            except:
                chosen_recipe = recipes[subs[0][0]]
        else:
            # try TF-IDF
            top = tfidf_top_matches(q, top_n=5)
            if not top:
                print("No matches found.")
                return
            print("Top matches:")
            for idx, (i, r, score) in enumerate(top, 1):
                print(f"{idx}. {r.get('dish_name')} (score {score:.2f})")
            try:
                sel = int(
                    input(f"Select 1-{len(top)} or press Enter for 1: ").strip() or "1"
                )
                chosen_recipe = top[sel - 1][1]
            except:
                chosen_recipe = top[0][1]
    else:
        print("Invalid selection.")
        return

    # Ask for number of people
    try:
        people = float(input("Enter number of people (e.g. 2): ").strip() or "2")
        if people <= 0:
            people = 2.0
    except:
        people = 2.0

    # show recipe details, scale and adjust instruction
    base_serv = detect_base_servings(chosen_recipe)
    scaled_ings = scale_ingredients(
        chosen_recipe.get("ingredients", []), base_serv, people
    )
    adjusted_instr = adjust_instruction_quantities(
        chosen_recipe.get("instructions", ""),
        chosen_recipe.get("ingredients", []),
        scaled_ings,
    )

    print("\n" + "=" * 60)
    print(f"Dish: {chosen_recipe.get('dish_name')}")
    print(f"Cuisine: {chosen_recipe.get('cuisine','')}")
    print(f"Type: {chosen_recipe.get('type','')}")
    print(f"Time to prepare (mins): {chosen_recipe.get('time_to_prepare_minutes','?')}")
    print(f"Servings (base): {base_serv}  -> Scaled to: {people}")
    print("\nInstructions (quantities adjusted):")
    print(
        adjusted_instr or chosen_recipe.get("instructions", "No instructions available")
    )
    print("\nIngredients (scaled):")
    for ing in scaled_ings:
        if ing.get("quantity") is not None:
            fmt = format_qty_to_str(ing["quantity"], ing.get("unit"))
            print(f" - {fmt} {ing.get('unit','')} {ing.get('ingredient')}")
        else:
            print(f" - {ing.get('ingredient')} (to taste / as needed)")

    print("=" * 60)


if __name__ == "__main__":
    run_interactive()