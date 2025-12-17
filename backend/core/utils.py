import ulid
def custom_id(length=25):
    uid = ulid.new()
    uid = uid.str
    return uid[:length]