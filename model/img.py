from model import schema


class img(object):
    def emo(self, emoname):
        with self.db.session_scope() as session:
            emo = session.query(schema.Emo).filter(schema.Emo.e_name == emoname).one_or_none()
            if emo is not None:
                emo.count +=1
                return emo.e_name
            else:
                emo = schema.Emo(e_name=emoname, count=1)
                session.add(emo)
                return emo.e_name

    def all_name(self):
        with self.db.session_scope() as session:
            emo = session.query(schema.Emo).all()
            if emo is not None:
                name = []
                for x in range(0,len(emo)):
                    name.append(emo[x].e_name)
                return name

    def all_count(self):
        #
        with self.db.session_scope() as session:
            emo = session.query(schema.Emo).all()
            if emo is not None:
                count = []
                for x in range(0,len(emo)):
                    count.append(emo[x].count)
                return count

    def api_results(self):
        with self.db.session_scope() as session:
            all = session.query(schema.Emo).all()
            return [dict(Name=emo.e_name, Count=emo.count) for emo in all]

    def __init__(self,db):
        self.db = db