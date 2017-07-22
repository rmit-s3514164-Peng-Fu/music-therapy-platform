from model import schema


class questionnaires(object):
    def all_questions(self):
        with self.db.session_scope() as session:
            allques = session.query(schema.Questions).all()
            que = []
            if all is not None:
                for x in range(0, len(allques)):
                    que.append(allques[x].q_question)
                return que

    def __init__(self, db):
        self.db = db
