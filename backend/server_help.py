import sqlite3
import string

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


def remove_digits_and_specials(arr):
    allowed_chars = set(string.ascii_letters)  #only english letters
    cleaned = []
    
    for item in arr:
        if len(item) <= 1:
            continue
        if all(char in allowed_chars for char in item):
            cleaned.append(item)
    
    return cleaned
