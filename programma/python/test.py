import sys
import platform

print("Python-test")
print("-" * 30)
print(f"Python-versie: {platform.python_version()}")
print(f"Systeem: {platform.system()} {platform.release()}")

# Simpele rekentest
resultaat = sum(range(1, 11))
assert resultaat == 55
print(f"Rekentest (som 1 t/m 10 = {resultaat}): OK")

# SQLite ingebouwd testen
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE test (id INTEGER, msg TEXT)")
conn.execute("INSERT INTO test VALUES (1, 'Hallo vanuit SQLite')")
rij = conn.execute("SELECT msg FROM test").fetchone()
print(f"SQLite-test: {rij[0]}")

print("-" * 30)
print("Alle Python-tests geslaagd ✔")