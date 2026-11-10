"""Builds tick.html from tick.template.html. Usage: python3 build.py [SCRIPT_URL]"""
import json, sys, pathlib
here = pathlib.Path(__file__).parent
url = sys.argv[1] if len(sys.argv) > 1 else (here / 'script_url.txt').read_text().strip() if (here / 'script_url.txt').exists() else ''
t = (here / 'tick.template.html').read_text()
t = t.replace('__SCRIPT_URL__', url).replace('__SPECIES__', (here / 'species.json').read_text())
(here / 'tick.html').write_text(t)
c = (here / 'comp.template.html').read_text().replace('__SCRIPT_URL__', url)
(here / 'comp.html').write_text(c)
print('built tick.html', 'with sync URL' if url else 'without sync URL')
