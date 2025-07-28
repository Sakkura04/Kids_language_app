
import os
import sqlite3
from docx import Document
import sqlite3
from create_databases import get_books_count

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BOOKS_DIR = os.path.join(BASE_DIR, '..', '..', 'frontend', 'assets', 'books')
DB_PATH = os.path.join(BASE_DIR, 'book.db')

def get_word_file():
    files = [f for f in os.listdir(BOOKS_DIR) if f.lower().endswith('.docx')]
    print("Available Word files:")
    for f in files:
        print(f"- {f}")
    while True:
        fname = input("Enter the exact file name to process (with .docx extension): ").strip()
        if fname in files:
            return fname
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

def insert_fragments_to_db(fragments, book_name=None):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    book_id = None
    cur.execute("SELECT id FROM books WHERE name = ?", (book_name,))
    result = cur.fetchone()
    if result:
        book_id = result[0]
    else:
        raise ValueError(f"Book '{book_name}' not found in books table.")

    for frag in fragments:
        cur.execute(
            "INSERT INTO book_fragments (book_id, chapter_name, text) VALUES (?, ?, ?)",
              (book_id, None, frag)
        )
    conn.commit()
    conn.close()
    print(f"Inserted {len(fragments)} fragments into book_fragments table.")

    
def add_fragments_to_db():
    fname = get_word_file()
    filepath =  os.path.join(BOOKS_DIR, fname)
    text = read_docx_text(filepath)
    while True:
        try:
            sentences_per_fragment = int(input("How many sentences per fragment? (default 3): ").strip() or 3)
            if sentences_per_fragment > 0:
                break
            else:
                print("Please enter a positive integer.")
        except ValueError:
            print("Please enter a valid integer.")
    fragments = split_into_fragments(text, sentences_per_fragment=sentences_per_fragment)
    book_name = os.path.splitext(fname)[0]
    insert_fragments_to_db(fragments, book_name=book_name)

def add_all_books_to_db():
    """
    Parses all .docx files in BOOKS_DIR and adds their names (without extension) to the books table in book.db.
    """
    files = [f for f in os.listdir(BOOKS_DIR) if f.lower().endswith('.docx')]
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for f in files:
        book_name = os.path.splitext(f)[0]
        # Check if already exists to avoid duplicates
        cur.execute("SELECT id FROM books WHERE name = ?", (book_name,))
        if cur.fetchone() is None:
            cur.execute("INSERT INTO books (name) VALUES (?)", (book_name,))
    conn.commit()
    conn.close()
    print(f"Added {len(files)} books to books table.")


if __name__ == "__main__":
    # Check if there are more PDF files than recordings in the books table
    pdf_files = [f for f in os.listdir(BOOKS_DIR) if f.lower().endswith('.pdf')]
    books_in_db = get_books_count()
    
    if len(pdf_files) > books_in_db:
        answer = input("Do you want to add all new books to the db? (yes/no): ").strip().lower()
        if answer in ("yes", "y"): 
            add_all_books_to_db()

    # Автоматично завантажити речення з Word-файлу у БД
    add_fragments_to_db()
