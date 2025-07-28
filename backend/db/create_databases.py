import sqlite3
import os

db_dir = r"D:\Canada research\thesis\db"

# --- Create book.db ---
book_db_path = os.path.join(db_dir, "book.db")
conn_book = sqlite3.connect(book_db_path)
cur_book = conn_book.cursor()

cur_book.execute("""
CREATE TABLE IF NOT EXISTS existing_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT,
    antonyms TEXT,
    synonyms TEXT,
    examples TEXT,
    transcription TEXT,
    syllables TEXT
)
""")

cur_book.execute("""
CREATE TABLE IF NOT EXISTS book_fragments (
    fragment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    chapter_name TEXT,
    text TEXT
)
""")

cur_book.execute("""
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
)
""")

conn_book.commit()
conn_book.close()

# --- Create results.db ---
results_db_path = os.path.join(db_dir, "results.db")
conn_results = sqlite3.connect(results_db_path)
cur_results = conn_results.cursor()

cur_results.execute("""
CREATE TABLE IF NOT EXISTS text (
    text_index INTEGER PRIMARY KEY AUTOINCREMENT,
    student_index INTEGER,
    read_part TEXT,
    results_analysis TEXT
)
""")

cur_results.execute("""
CREATE TABLE IF NOT EXISTS mistakes (
    mistake_index INTEGER PRIMARY KEY AUTOINCREMENT,
    student_index INTEGER,
    word_index INTEGER,
    recognized_by_meaning INTEGER CHECK(recognized_by_meaning BETWEEN 0 AND 5),
    pronounced_correctly INTEGER CHECK(pronounced_correctly BETWEEN 0 AND 5)
)
""")

conn_results.commit()
conn_results.close()

print("Databases and tables created successfully.")