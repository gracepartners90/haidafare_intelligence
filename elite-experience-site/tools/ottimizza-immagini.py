"""Versioni leggere delle foto per il sito (WebP in più larghezze).

Per ogni foto in src/assets/media crea in src/assets/media/opt/ le versioni WebP
larghe 640, 1024, 1600 e 2048 px (solo quelle più piccole dell'originale) più una
alla larghezza originale (al massimo 2560 px). Il build le usa in automatico: ogni
dispositivo scarica la misura che gli serve; l'originale JPG resta come riserva.

Uso, dopo aver aggiunto o sostituito una foto:  python3 tools/ottimizza-immagini.py
Rigenera solo le versioni mancanti o più vecchie dell'originale.
"""
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'media')
OUT = os.path.join(ROOT, 'opt')
WIDTHS = (640, 1024, 1600, 2048)
MAX_WIDTH = 2560
QUALITY = 78


def widths_for(w):
    return sorted({x for x in WIDTHS if x < w} | {min(w, MAX_WIDTH)})


def main():
    made = 0
    for dirpath, _, files in os.walk(ROOT):
        if os.path.abspath(dirpath).startswith(os.path.abspath(OUT)):
            continue
        for f in sorted(files):
            if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            src = os.path.join(dirpath, f)
            rel = os.path.splitext(os.path.relpath(src, ROOT))[0]
            with Image.open(src) as im:
                im = im.convert('RGB')
                for w in widths_for(im.width):
                    dst = os.path.join(OUT, f'{rel}-{w}.webp')
                    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                        continue
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    out = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
                    out.save(dst, 'WEBP', quality=QUALITY, method=6)
                    made += 1
    print(f'{made} versioni create in {os.path.relpath(OUT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
