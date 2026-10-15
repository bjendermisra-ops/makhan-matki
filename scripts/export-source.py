"""Export distributable source without repository identity, data or secrets."""
from pathlib import Path
import json
import subprocess
import zipfile
root = Path(__file__).resolve().parent.parent
files = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
out = root / 'public/downloads/makhan-matki-source.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(set(files)):
        p = root / name
        if not name or not p.is_file():
            continue
        if name.startswith(('.openai/', '.sites/', 'public/downloads/', 'source-art/')) or p.name.startswith(('.env', '.dev.vars')) or name == 'wrangler.external.json':
            continue
        archive.write(p, 'makhan-matki/' + name)
    archive.writestr('makhan-matki/.openai/hosting.json', json.dumps({'d1': 'DB', 'r2': None}))
print(f'Exported source: {out.stat().st_size} bytes')
