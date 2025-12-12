#!/usr/bin/env python3
"""
Icon Generator für DS-Sheet PWA
Erstellt alle benötigten Icon-Größen
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon-Größen die benötigt werden
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Farben
BG_COLOR = "#4CAF50"  # Grün
TEXT_COLOR = "#FFFFFF"  # Weiß
CIRCLE_COLOR = "#2E7D32"  # Dunkelgrün

OUTPUT_DIR = "/workspaces/DS-Sheet/client/public/icons"

def create_icon(size):
    """Erstellt ein Icon in der angegebenen Größe"""
    
    # Erstelle Bild mit grünem Hintergrund
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Zeichne einen Kreis im Hintergrund
    margin = size // 8
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, fill=CIRCLE_COLOR)
    
    # Text "DS" in der Mitte
    font_size = size // 3
    try:
        # Versuche TrueType Font zu laden
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        # Fallback auf Standard-Font
        font = ImageFont.load_default()
    
    text = "DS"
    
    # Berechne Text-Position (zentriert)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - font_size // 10
    
    # Zeichne Text
    draw.text((x, y), text, font=font, fill=TEXT_COLOR)
    
    # Speichere Icon
    output_path = os.path.join(OUTPUT_DIR, f"icon-{size}.png")
    img.save(output_path, "PNG")
    print(f"✓ Erstellt: icon-{size}.png")

def main():
    """Hauptfunktion"""
    print("🎵 DS-Sheet Icon Generator")
    print("=" * 40)
    
    # Stelle sicher, dass Output-Verzeichnis existiert
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Erstelle alle Icons
    for size in SIZES:
        create_icon(size)
    
    print("=" * 40)
    print(f"✅ Alle {len(SIZES)} Icons erstellt!")
    print(f"📁 Speicherort: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
