from contextlib import contextmanager

import sqlalchemy
from sqlalchemy.orm import sessionmaker
from model import schema
from utils import web


class ORM(object):
    """
    The Object Relational Model to use.
    Can be any database, but tried and tested on PostgreSQL
    """
    def __init__(self):
        self.engine = sqlalchemy.create_engine(web.get_config()['DB_URL'])
        self.session_factory = sessionmaker(bind=self.engine)
        schema.metadata.create_all(self.engine) # create the DDL

    @contextmanager
    def session_scope(self):
        session = self.session_factory(expire_on_commit=False)
        try:
            yield session
            session.commit()
        except:
            session.rollback()
            raise
        finally:
            session.close()
