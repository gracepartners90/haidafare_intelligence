#!/bin/sh
# Genera index.html (apribile direttamente nel browser) dal sorgente artifact growth-plan.html.
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  sed -n '1,/<\/style>/p' growth-plan.html
  printf '</head>\n<body>\n'
  sed '1,/<\/style>/d' growth-plan.html
  printf '</body>\n</html>\n'
} > index.html
