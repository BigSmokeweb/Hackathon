import zipfile
import xml.etree.ElementTree as ET
import re
import json
import random
import os

# 1. Parse AREA_COORDINATES and EXPERIENCE_PHOTOS from backend/prisma/import-dataset.ts
with open('backend/prisma/import-dataset.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

area_coords = {}
area_block = re.search(r'const AREA_COORDINATES.*?\=\s*(\{.*?\n\};)', ts_content, re.DOTALL)
if area_block:
    for line in area_block.group(1).splitlines():
        m = re.search(r"'([^']+)':\s*\{\s*lat:\s*([0-9\.-]+),\s*lng:\s*([0-9\.-]+)", line)
        if m:
            area_coords[m.group(1)] = {'lat': float(m.group(2)), 'lng': float(m.group(3))}

exp_photos = {}
photo_block = re.search(r'const EXPERIENCE_PHOTOS.*?\=\s*(\{.*?\n\};)', ts_content, re.DOTALL)
if photo_block:
    for line in photo_block.group(1).splitlines():
        m = re.search(r"'([^']+)':\s*'([^']+)'", line)
        if m:
            exp_photos[m.group(1)] = m.group(2)

print(f"Loaded {len(area_coords)} coords, {len(exp_photos)} curated photos")

# 2. Parse Excel dataset
with zipfile.ZipFile('Mumbai_Jaipur_Ahmedabad_Experiences_Dataset.xlsx') as z:
    sheet_xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    stree = ET.fromstring(sheet_xml)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rows = []
    for r in stree.findall('.//ns:row', ns):
        cells = []
        for c in r.findall('.//ns:c', ns):
            is_tag = c.find('.//ns:is/ns:t', ns)
            v_tag = c.find('.//ns:v', ns)
            txt = ''
            if is_tag is not None and is_tag.text:
                txt = is_tag.text
            elif v_tag is not None and v_tag.text:
                txt = v_tag.text
            cells.append(txt.strip())
        if cells:
            rows.append(cells)

data_rows = rows[1:]

def map_category(raw):
    r = (raw or '').lower()
    if 'food' in r or 'café' in r or 'cafe' in r: return 'FOOD'
    if 'adventure' in r: return 'ADVENTURE'
    if 'shop' in r: return 'SHOPPING'
    if 'workshop' in r or 'craft' in r or 'art' in r: return 'WORKSHOPS'
    if 'culture' in r or 'heritage' in r or 'history' in r: return 'CULTURE'
    if 'nightlife' in r or 'entertainment' in r: return 'NIGHTLIFE'
    return 'HIDDEN_GEMS'

category_labels = {
    'FOOD': 'Culinary & Food',
    'CULTURE': 'Heritage & Culture',
    'WORKSHOPS': 'Artisan Workshops',
    'ADVENTURE': 'Outdoor & Adventure',
    'HIDDEN_GEMS': 'Hidden Enclaves',
    'NIGHTLIFE': 'Nightlife & Music',
    'SHOPPING': 'Artisan Shopping'
}

def parse_price(raw):
    if not raw or 'free' in raw.lower():
        return 0, 0
    nums = [int(n) for n in re.findall(r'\d+', raw)]
    if not nums: return 0, 0
    if len(nums) == 1: return nums[0], nums[0]
    return nums[0], nums[1]

def parse_duration(raw):
    nums = [float(n) for n in re.findall(r'\d+(?:\.\d+)?', raw)]
    if not nums: return 90
    if 'min' in raw.lower():
        return int(nums[0])
    avg_hr = sum(nums) / len(nums)
    return int(round(avg_hr * 60))

def get_coords(area, city):
    if area in area_coords:
        return area_coords[area]
    for k, v in area_coords.items():
        if k.lower() in area.lower() or area.lower() in k.lower():
            return v
    defaults = {
        'Mumbai': {'lat': 18.9220, 'lng': 72.8347},
        'Jaipur': {'lat': 26.9124, 'lng': 75.7873},
        'Ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
    }
    return defaults.get(city, {'lat': 18.9220, 'lng': 72.8347})

experiences = []
random.seed(42)

for row in data_rows:
    if len(row) < 5: continue
    raw_id, name, city, area, raw_cat = row[0], row[1], row[2], row[3], row[4]
    price_raw = row[5] if len(row) > 5 else ''
    dur_raw = row[6] if len(row) > 6 else ''
    best_time = row[7] if len(row) > 7 else ''
    best_for = row[8] if len(row) > 8 else ''
    vibe = row[9] if len(row) > 9 else ''
    tags_raw = row[10] if len(row) > 10 else ''
    tip = row[11] if len(row) > 11 else ''

    cat = map_category(raw_cat)
    p_min, p_max = parse_price(price_raw)
    dur = parse_duration(dur_raw)
    base_coord = get_coords(area, city)
    
    # Micro jitter for visual separation on map
    jitter_lat = round(base_coord['lat'] + (random.random() - 0.5) * 0.005, 6)
    jitter_lng = round(base_coord['lng'] + (random.random() - 0.5) * 0.005, 6)

    photo = exp_photos.get(name, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80')
    rating = round(4.82 + random.random() * 0.16, 2)
    authenticity = round(0.92 + random.random() * 0.07, 2)

    desc = f"{name} located in {area}, {city}. Best experienced during {best_time.lower() if best_time else 'daytime'}. {tip if tip else f'A signature experience tailored for {best_for}.'}"

    exp_item = {
        'id': f'exp-{raw_id.lower()}',
        'title': name,
        'category': cat,
        'categoryLabel': category_labels.get(cat, 'Heritage & Culture'),
        'city': city,
        'area': area,
        'priceMin': p_min,
        'priceMax': p_max,
        'durationMinutes': dur,
        'ratingAverage': rating,
        'authenticityRating': authenticity,
        'candidateLat': jitter_lat,
        'candidateLng': jitter_lng,
        'mediaUrls': [photo],
        'description': desc,
        'bestTime': best_time,
        'bestFor': best_for,
        'vibe': vibe,
        'tags': [t.strip() for t in tags_raw.split(',') if t.strip()],
        'humanTip': tip,
        'provider': {
            'businessName': f"{area} Custodian Guild" if random.random() > 0.4 else None,
            'verificationStatus': 'VERIFIED'
        }
    }
    experiences.append(exp_item)

print(f"Compiled {len(experiences)} total experiences")

ts_out = "// Auto-generated comprehensive experiences catalog from Mumbai_Jaipur_Ahmedabad_Experiences_Dataset.xlsx\n"
ts_out += "export interface ExperienceData {\n"
ts_out += "  id: string;\n"
ts_out += "  title: string;\n"
ts_out += "  category: string;\n"
ts_out += "  categoryLabel?: string;\n"
ts_out += "  city: string;\n"
ts_out += "  area: string;\n"
ts_out += "  priceMin: number;\n"
ts_out += "  priceMax: number;\n"
ts_out += "  durationMinutes: number;\n"
ts_out += "  ratingAverage: number;\n"
ts_out += "  authenticityRating: number;\n"
ts_out += "  candidateLat: number;\n"
ts_out += "  candidateLng: number;\n"
ts_out += "  mediaUrls: string[];\n"
ts_out += "  description: string;\n"
ts_out += "  bestTime?: string;\n"
ts_out += "  bestFor?: string;\n"
ts_out += "  vibe?: string;\n"
ts_out += "  tags?: string[];\n"
ts_out += "  humanTip?: string;\n"
ts_out += "  provider?: {\n"
ts_out += "    businessName?: string | null;\n"
ts_out += "    verificationStatus?: string;\n"
ts_out += "  };\n"
ts_out += "}\n\n"
ts_out += "export const ALL_EXPERIENCES: ExperienceData[] = " + json.dumps(experiences, indent=2) + ";\n"

os.makedirs('frontend/src/lib', exist_ok=True)
with open('frontend/src/lib/experiences-data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_out)

print("Created frontend/src/lib/experiences-data.ts successfully!")
