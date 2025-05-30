import unicodedata

def normalize_str(s):
    return unicodedata.normalize('NFKD', s).encode('ascii', errors='ignore').decode('utf-8')
