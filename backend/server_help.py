import sqlite3

def extract_missing_keywords_from_result(result):
    """
    Given a result dictionary (as returned by process_audio_and_text),
    extract the 'missed_keywords' and 'new_keywords' fields and return them as arrays.
    If the fields are not present or not lists, return empty lists for them.
    """
    missed = result.get('missed_keywords', [])
    new = result.get('new_keywords', [])
    # Ensure both are lists (in case they are not)
    if not isinstance(missed, list):
        missed = list(missed) if isinstance(missed, (set, tuple)) else [missed]
    if not isinstance(new, list):
        new = list(new) if isinstance(new, (set, tuple)) else [new]
    return missed, new

def get_first_fragment_id(book_id):
    """
    Returns the ID of the first fragment for the specified book from the book_fragments table.
    Returns None if no fragments are found for the book.
    """
    DB_PATH = "db/book.db"
    conn = sqlite3.connect(DB_PATH)
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
    DB_PATH = "db/book.db"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT MAX(fragment_id) FROM book_fragments WHERE book_id = ?", (book_id,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row and row[0] is not None else 0

def get_fragment_by_id_(fragment_id):
    """
    Returns the fragment record from the book_fragments table by the given fragment_id and book_id.
    Returns a dictionary with the fragment data or None if not found.
    """
    DB_PATH = "db/book.db"
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
