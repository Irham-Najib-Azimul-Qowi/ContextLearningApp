import os
import re
from pathlib import Path
import psycopg

env_vars = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        m = re.match(r'^([A-Za-z0-9_]+)=(.*)$', line.strip())
        if m:
            env_vars[m.group(1)] = m.group(2).strip("\"'")

db_url = env_vars.get('DATABASE_URL')
conn = psycopg.connect(db_url, autocommit=True)
cur = conn.cursor()

migration_file = Path('supabase/migrations/20260927120000_depaskan_e2e_schema.sql')
with open(migration_file, 'r', encoding='utf-8') as f:
    sql = f.read()

print("Applying migration:", migration_file)
cur.execute(sql)
print("Migration applied successfully!")

# Verify
cur.execute("SELECT id, name, public FROM storage.buckets WHERE id='avatars';")
print("Storage bucket:", cur.fetchall())

cur.execute("SELECT count(*) FROM public.room_submissions;")
print("room_submissions count:", cur.fetchall()[0][0])

cur.execute("SELECT count(*) FROM public.document_issuances;")
print("document_issuances count:", cur.fetchall()[0][0])

conn.close()
