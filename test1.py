import json

json_path = r"D:\CookIQ\backend\api\recipes.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

seen = set()
deduped = []
for rec in data:
    dish = (rec.get("dish_name") or rec.get("title") or "").strip().lower()
    if dish and dish not in seen:
        deduped.append(rec)
        seen.add(dish)

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)
