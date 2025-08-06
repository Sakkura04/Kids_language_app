import os
import sqlite3
from docx import Document
from db.gpt_api import generate_word_info
import sqlite3

BOOKS_DIR = r"D:\Canada research\frontend\assets\books"
BOOK_DB_PATH = "db/book.db"
RESULT_DB_PATH = "db/results.db"

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
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()
    for frag in fragments:
        cur.execute(
            "INSERT INTO book_fragments (book_id, chapter_name, text) VALUES (?, ?, ?)",
            (book_id, None, frag)
        )
    conn.commit()
    conn.close()
    print(f"Inserted {len(fragments)} fragments into book_fragments table.")

# def print_table(table_name):
#     conn = sqlite3.connect(DB_PATH)
#     cur = conn.cursor()
#     cur.execute(f"SELECT * FROM {table_name}")
#     rows = cur.fetchall()
#     # Вивести назви колонок
#     col_names = [description[0] for description in cur.description]
#     print(" | ".join(col_names))
#     print("-" * 50)
#     # Вивести всі рядки
#     for row in rows:
#         print(" | ".join(str(x) if x is not None else "" for x in row))
#     conn.close()

def add_result_text_record(read_part, results_analysis):
    """
    Inserts a new record into the 'text' table of results.db with:
    - student_index: 1
    - read_part: the part of the text the child has read
    - results_analysis: the analysis result (as string)
    """
    import sqlite3
    conn = sqlite3.connect(RESULT_DB_PATH)
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
    conn = sqlite3.connect(BOOK_DB_PATH)
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
    conn = sqlite3.connect(BOOK_DB_PATH)
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
    conn = sqlite3.connect(RESULT_DB_PATH)
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
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE text SET results_analysis = ? WHERE read_part = ?",
        (str(new_results_analysis), read_part)
    )
    conn.commit()
    updated = cur.rowcount > 0
    conn.close()
    return updated

#------------------------BOOK.EXISTING_WORDS----------------------------
def fill_existing_words(word):
    """
    Uses GPT to generate meaning, antonyms, synonyms, examples, transcription, and syllables for the given word,
    and inserts a new record into the existing_words table in book.db.
    """
    info = generate_word_info(word)
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO existing_words (word, meaning, antonyms, synonyms, examples, transcription, syllables) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            word,
            info.get("meaning", ""),
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
    conn = sqlite3.connect(BOOK_DB_PATH)
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

def syllables_from_existing_words(word):
    """
    Checks if the given word exists in the existing_words table in book.db.
    Returns the index (rowid) if it exists, -1 otherwise.
    If the word is empty or None, or the table is empty, returns -1 immediately.
    """
    if not word:
        return -1
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()
    # Check if the table is empty
    cur.execute("SELECT COUNT(*) FROM existing_words")
    count = cur.fetchone()[0]
    if count == 0:
        conn.close()
        return -1
    cur.execute("SELECT syllables FROM existing_words WHERE word = ? LIMIT 1", (word,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else -1

def get_random_meanings_except(excluded_meaning):
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()

    query = """
    SELECT id, meaning 
    FROM existing_words 
    WHERE meaning != ? 
    ORDER BY RANDOM() 
    LIMIT 3
    """

    cur.execute(query, (excluded_meaning,))
    rows = cur.fetchall()
    conn.close()

    result = [{"id": row[0], "meaning": row[1]} for row in rows]
    return result

    
def get_words_vocabulary():
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    conn.execute(f"ATTACH DATABASE '{BOOK_DB_PATH}' AS book")

    query = """
    SELECT 
        m.word_index, 
        m.recognized_by_meaning, 
        b.word, 
        b.meaning, 
        b.antonyms,
        b.synonyms,
        b.examples
    FROM mistakes m
    JOIN book.existing_words b ON m.word_index = b.id
    WHERE m.recognized_by_meaning < 5
    """
    cur.execute(query)
    results = cur.fetchall()
    print("AAAAA")
    vocab = []
    print("results:", results)
    for word_data in results:
        rand_meanings = get_random_meanings_except(word_data[3])
        # Extract just the meaning strings from the objects
        options = [item["meaning"] for item in rand_meanings]
        # Add the correct meaning to the options
        options.append(word_data[3])
        vocab.append({
            "id": word_data[0],
            "recognized_by_meaning": word_data[1],
            "word": word_data[2],
            "meaning": word_data[3],
            "antonyms": word_data[4],
            "synonyms": word_data[5],
            "examples": word_data[6],
            "options": options
        })

    conn.close()
    return vocab

#------------------------RESULTS.MISTAKES----------------------------
def add_mistake(word, word_id):
    """
    Inserts a record into the mistakes table:
    1. student_index (always 1)
    2. word_id (index of the word from existing_words table)
    3. recognized_by_meaning (int, max 5, set to 0 at creation)
    4. pronounced_correctly (int, max 5, set to 0 at creation)
    Before inserting, checks if the mistakes table is not empty.
    """
    conn = sqlite3.connect(RESULT_DB_PATH)
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

def get_mistakes_with_words():
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    conn.execute(f"ATTACH DATABASE '{BOOK_DB_PATH}' AS book")

    query = """
    SELECT 
        m.word_index, 
        m.pronounced_correctly, 
        b.word, 
        b.transcription, 
        b.syllables
    FROM mistakes m
    JOIN book.existing_words b ON m.word_index = b.id
    WHERE m.pronounced_correctly < 5
    """
    cur.execute(query)
    results = cur.fetchall()

    mistakes = []
    print("results:", results)
    for word_data in results:
        mistakes.append({
            "id": word_data[0],
            "pronounced_correctly": word_data[1],
            "word": word_data[2],
            "ipa": word_data[3],
            "segments": word_data[4].split("-") if word_data[4] else []
        })

    conn.close()
    return mistakes

def check_word_mastery(word_id):
    """
    Checks if a word in the mistakes table has both recognized_by_meaning and pronounced_correctly equal to 5.
    Returns True if both are 5, False otherwise.
    """
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT recognized_by_meaning, pronounced_correctly FROM mistakes WHERE word_index = ?",
        (word_id,)
    )
    row = cur.fetchone()
    conn.close()
    
    if row:
        recognized, pronounced = row
        return recognized == 5 and pronounced == 5
    else:
        return False

def increase_recognition(word_id):
    """
    Increases the recognized_by_meaning field by 1 for the given word_id.
    If the value is already 5, nothing happens.
    """
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE mistakes SET recognized_by_meaning = recognized_by_meaning + 1 WHERE word_index = ? AND recognized_by_meaning < 5",
        (word_id,)
    )
    conn.commit()
    conn.close()


#------------------------BOOK.FRAGMENTS----------------------------
def get_fragment_by_id(fragment_id):
    """
    Returns the fragment record from the book_fragments table by the given fragment_id and book_id.
    Returns a dictionary with the fragment data or None if not found.
    """
    conn = sqlite3.connect(BOOK_DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM book_fragments WHERE fragment_id = ?", (fragment_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    else:
        return None


def get_first_fragment_id(book_id):
    """
    Returns the ID of the first fragment for the specified book from the book_fragments table.
    Returns None if no fragments are found for the book.
    """
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT MIN(fragment_id) FROM book_fragments WHERE book_id = ?", (book_id,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row and row[0] is not None else 0

def get_last_fragment_id(book_id):
    """
    Returns the ID of the last fragment for the specified book from the book_fragments table.
    Returns 0 if no fragments are found for the book.
    """
    conn = sqlite3.connect(BOOK_DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT MAX(fragment_id) FROM book_fragments WHERE book_id = ?", (book_id,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row and row[0] is not None else 0

def increase_recognition(word_id):
    """
    Increases the recognized_by_meaning value for a word in the mistakes table.
    The value is capped at 5.
    """
    conn = sqlite3.connect(RESULT_DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE mistakes SET recognized_by_meaning = recognized_by_meaning + 1 WHERE word_index = ? AND recognized_by_meaning < 5",
        (word_id,)
    )
    conn.commit()
    conn.close()
    return True



