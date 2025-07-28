import os
import sqlite3
from docx import Document
from db.gpt_api import generate_word_info
import sqlite3

BOOKS_DIR = r"D:\Canada research\frontend\assets\books"
DB_PATH = r"D:\Canada research\thesis\db\book.db"

def get_word_file():
    files = [f for f in os.listdir(BOOKS_DIR) if f.lower().endswith('.docx')]
    print("Available Word files:")
    for f in files:
        print(f"- {f}")
    while True:
        fname = input("Enter the exact file name to process (with .docx extension): ").strip()
        if fname in files:
            return os.path.join(BOOKS_DIR, fname)
        else:
            print("File not found. Please enter a valid file name from the list above.")

def read_docx_text(filepath):
    doc = Document(filepath)
    text = '\n'.join([para.text for para in doc.paragraphs])
    return text

def split_into_fragments(text, sentences_per_fragment=3):
    import re
    # Split text into sentences (naive split on dot, exclamation, question)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    fragments = []
    for i in range(0, len(sentences), sentences_per_fragment):
        frag = ' '.join(sentences[i:i+sentences_per_fragment]).strip()
        if frag:
            fragments.append(frag)
    return fragments

def insert_fragments_to_db(fragments, book_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for frag in fragments:
        cur.execute(
            "INSERT INTO book_fragments (book_id, chapter_name, text) VALUES (?, ?, ?)",
            (book_id, None, frag)
        )
    conn.commit()
    conn.close()
    print(f"Inserted {len(fragments)} fragments into book_fragments table.")

def print_table(table_name):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {table_name}")
    rows = cur.fetchall()
    # Вивести назви колонок
    col_names = [description[0] for description in cur.description]
    print(" | ".join(col_names))
    print("-" * 50)
    # Вивести всі рядки
    for row in rows:
        print(" | ".join(str(x) if x is not None else "" for x in row))
    conn.close()

def add_result_text_record(read_part, results_analysis):
    """
    Inserts a new record into the 'text' table of results.db with:
    - student_index: 1
    - read_part: the part of the text the child has read
    - results_analysis: the analysis result (as string)
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\results.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO text (student_index, read_part, results_analysis) VALUES (?, ?, ?)",
        (1, read_part, str(results_analysis))
    )
    conn.commit()
    conn.close()

def find_fragment_by_text(search_text):
    """
    Searches for a fragment in the book_fragments table by the exact 'text' column value.
    Returns the fragment_id (index) if found, else None.
    """
    DB_PATH = r"D:\Canada research\thesis\db\book.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT fragment_id FROM book_fragments WHERE text = ?", (search_text,))
    result = cur.fetchone()
    conn.close()
    if result:
        return result[0]
    else:
        return None     

def update_fragment_by_id(fragment_id, new_text=None, new_chapter_name=None):
    """
    Updates the text and/or chapter_name of a fragment in book_fragments by its fragment_id.
    Only updates fields that are not None.
    Returns True if update was successful (row existed), False otherwise.
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\book.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    fields = []
    values = []
    if new_text is not None:
        fields.append("text = ?")
        values.append(new_text)
    if new_chapter_name is not None:
        fields.append("chapter_name = ?")
        values.append(new_chapter_name)
    if not fields:
        conn.close()
        return False  # Nothing to update
    values.append(fragment_id)
    sql = f"UPDATE book_fragments SET {', '.join(fields)} WHERE fragment_id = ?"
    cur.execute(sql, values)
    conn.commit()
    updated = cur.rowcount > 0
    conn.close()
    return updated


def find_text_record_by_read_part(read_part):
    """
    Searches for a record in the text table by the exact read_part value.
    Returns the text_index if found, else None.
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\results.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT text_index FROM text WHERE read_part = ?", (read_part,))
    result = cur.fetchone()
    conn.close()
    if result:
        return result[0]
    else:
        return None

def update_text_record_by_read_part(read_part, new_results_analysis):
    """
    Updates the results_analysis of a record in the text table by its read_part.
    Returns True if update was successful, False otherwise.
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\results.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE text SET results_analysis = ? WHERE read_part = ?",
        (str(new_results_analysis), read_part)
    )
    conn.commit()
    updated = cur.rowcount > 0
    conn.close()
    return updated

def fill_existing_words(word):
    """
    Uses GPT to generate antonyms, synonyms, examples, transcription, and syllables for the given word,
    and inserts a new record into the existing_words table in book.db.
    """
    DB_PATH = r"D:\Canada research\thesis\db\book.db"
    info = generate_word_info(word)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO existing_words (word, antonyms, synonyms, examples, transcription, syllables) VALUES (?, ?, ?, ?, ?, ?)",
        (
            word,
            info.get("antonyms", ""),
            info.get("synonyms", ""),
            ", ".join(info.get("examples", [])) if isinstance(info.get("examples", ""), list) else info.get("examples", ""),
            info.get("transcription", ""),
            info.get("syllables", "")
        )
    )
    conn.commit()
    conn.close()
    return True

def word_exists_in_existing_words(word):
    """
    Checks if the given word exists in the existing_words table in book.db.
    Returns the index (rowid) if it exists, -1 otherwise.
    If the word is empty or None, or the table is empty, returns -1 immediately.
    """
    if not word:
        return -1
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\book.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # Check if the table is empty
    cur.execute("SELECT COUNT(*) FROM existing_words")
    count = cur.fetchone()[0]
    if count == 0:
        conn.close()
        return -1
    cur.execute("SELECT rowid FROM existing_words WHERE word = ? LIMIT 1", (word,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else -1

def add_mistake(word, word_id):
    """
    Inserts a record into the mistakes table:
    1. student_index (always 1)
    2. word_id (index of the word from existing_words table)
    3. recognized_by_meaning (int, max 5, set to 0 at creation)
    4. pronounced_correctly (int, max 5, set to 0 at creation)
    Before inserting, checks if the mistakes table is not empty.
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\results.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # Check if the mistakes table is not empty
    cur.execute("SELECT COUNT(*) FROM mistakes")
    count = cur.fetchone()[0]
    if count == 0:
        print("The mistakes table is currently empty.")
    # Insert into mistakes table
    cur.execute(
        "INSERT INTO mistakes (student_index, word_index, recognized_by_meaning, pronounced_correctly) VALUES (?, ?, ?, ?)",
        (1, word_id, 0, 0)
    )
    conn.commit()
    conn.close()

def get_fragment_by_id(fragment_id):
    """
    Returns the record from the book_fragments table in book.db by the given fragment_id.
    Returns a dictionary with column names as keys, or None if not found.
    """
    import sqlite3
    DB_PATH = r"D:\Canada research\thesis\db\book.db"
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM book_fragments WHERE fragment_id = ?", (fragment_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    else:
        return None
