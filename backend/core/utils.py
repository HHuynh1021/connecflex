import ulid
def custom_id(length=100, prefix=None):
    if prefix:
        uid = ulid.new()
        uid = uid.str
        uid = f"{prefix}-{uid}"
    return uid[:length]