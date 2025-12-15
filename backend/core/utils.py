import ulid

def custom_id(length=25, prefix=None):
    uid = str(ulid.new()).lower()
    if prefix:
        uid = f"{prefix}{uid}"
    return uid[:length]