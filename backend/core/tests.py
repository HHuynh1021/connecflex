import ulid

def custom_id(length=25):
    uid = str(ulid.new()).lower()
    return uid[:length]
string = custom_id()
print(string)