import pandas as pd
import re
import fractions
import json
from tqdm import tqdm  # progress bar (optional, install via pip install tqdm)

df = pd.read_excel(r"E:\Data Analysis\Python\22IT479\MinorProj\Indori.xlsx")


def fraction_to_float(x):
    """Convert fractions like 1/2, 3/4, ½ into float"""
    try:
        # Handle unicode fractions (½, ¼, ¾)
        x = x.replace("½", "1/2").replace("¼", "1/4").replace("¾", "3/4")
        return float(sum(fractions.Fraction(s) for s in x.split()))
    except:
        return None


def parse_ingredient(line):
    """Parse ingredient string into {ingredient, quantity, unit}"""
    parts = line.strip().split()
    qty = None
    unit = None
    ingredient = []

    for i, p in enumerate(parts):
        # Match numbers, decimals, or fractions
        if (
            re.match(r"^\d+(/\d+)?$", p)
            or re.match(r"^\d+(\.\d+)?$", p)
            or any(x in p for x in ["½", "¼", "¾"])
        ):
            qty = fraction_to_float(p)
        # If a unit comes right after number
        elif qty is not None and unit is None and re.match(r"[a-zA-Z]+", p):
            unit = p
        else:
            ingredient.append(p)

    return {"ingredient": " ".join(ingredient).strip(), "quantity": qty, "unit": unit}


parsed_data = []

for _, row in tqdm(df.iterrows(), total=len(df)):
    dish_name = row.get("recipe name") or row.get("Recipe Name") or "Unknown Dish"
    ingredients_text = str(row.get("ingredients") or row.get("Ingredients") or "")
    cuisine_type = row.get("Type") or "Unknown"
    cuisine = row.get("Cuisine") or "Unknown"
    time_to_prepare = row.get("Time to Prepare(in min)") or "Unknown"
    instruction = row.get("Instructions") or ""
    image_link = row.get("Image Link") or ""

    ingredients_list = [
        line for line in re.split(r"[\n,]", ingredients_text) if line.strip()
    ]

    parsed_ingredients = [parse_ingredient(line) for line in ingredients_list]

    parsed_data.append(
        {
            "dish": dish_name.strip(),
            "type": cuisine_type,
            "cuisine": cuisine,
            "time_to_prepare": time_to_prepare,
            "instruction": instruction,
            "image_link": image_link,
            "parsed_ingredients": parsed_ingredients,
        }
    )

with open("recipes.json", "w", encoding="utf-8") as f:
    json.dump(parsed_data, f, indent=4, ensure_ascii=False)

print("✅ Done! Parsed data saved to recipes.json")
