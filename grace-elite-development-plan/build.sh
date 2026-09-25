#!/bin/sh
# index.html  → documento completo che collega styles.css e script.js (condivisione interna, apertura locale)
# artifact.html → file unico con CSS e JS inline, pubblicabile come artifact claude.ai
cd "$(dirname "$0")"
HEAD='<title>Élite Experience Development Plan</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500&display=swap">'
{
  printf '<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '%s\n<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n' "$HEAD"
  cat content.html
  printf '<script src="script.js"></script>\n</body>\n</html>\n'
} > index.html
{
  printf '%s\n<style>\n' "$HEAD"
  cat styles.css
  printf '</style>\n'
  cat content.html
  printf '<script>\n'
  cat script.js
  printf '</script>\n'
} > artifact.html
