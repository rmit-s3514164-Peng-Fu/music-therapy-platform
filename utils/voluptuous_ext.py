from voluptuous import *
from functools import wraps


def String(max_length=None):
    @wraps(String)
    def f(v):
        try:
            v = str(v)
        except:
            raise Invalid('Not a string') from None
        if max_length is not None:
            if len(v) > max_length:
                raise Invalid('Length is too long')
        return v
    return f


def validate(schema, data, **kwargs):
    return Schema(schema, **kwargs)(data)