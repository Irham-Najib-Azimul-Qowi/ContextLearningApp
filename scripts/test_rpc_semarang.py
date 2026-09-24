import json
from pathlib import Path
import psycopg
import sys
sys.path.append(str(Path(__file__).resolve().parent))
from apply_remote_migrations import load_env_local

env = load_env_local(Path('.'))
conn = psycopg.connect(env['DATABASE_URL'])
cur = conn.cursor()
cur.execute("SELECT public.lkb_retrieve_context(p_region_id := '33.74'::text, p_query := 'lawang'::text, p_limit := 2);")
res = cur.fetchone()[0]
print("RESULT FOR KOTA SEMARANG (33.74):")
print(json.dumps(res, indent=2))
