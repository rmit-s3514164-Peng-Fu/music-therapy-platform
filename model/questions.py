from model import schema
from utils.web import RequestApiException
from utils import voluptuous_ext as v

class QuestionManager(object):

    new_question_schema = {
        v.Required('category_id'): v.Coerce(int),
        v.Optional('activity_id', default=None): v.Any(None, v.Coerce(int)),
        v.Optional('is_positive', default=True): v.Boolean(),
        v.Required('prompt'): v.String(1000),
        v.Required('text_often'): v.String(2000),
        v.Required('text_sometimes'): v.String(2000),
        v.Required('text_rarely'): v.String(2000)
    }

    new_category_schema = {
        v.Required('title'): v.String()
    }

    def __init__(self, db):
        self.db = db

    def new_category(self, title):
        with self.db.session_scope() as session:
            category = schema.QuestionCategory(title=title)
            session.add(category)
        return category

    def api_new_category(self, params):
        params = v.validate(self.new_category_schema, params)
        category = self.new_category(params['title'])
        return dict(id=category.category_id, title=category.title, questions=[])

    def api_all_categories(self):
        with self.db.session_scope() as session:
            categories = session.query(schema.QuestionCategory).all()
            return [dict(id=category.category_id, title=category.title,
                         questions=[dict(id=q.q_id, prompt=q.prompt) for q in category.questions])
                    for category in categories]

    def api_categories_and_questions(self):
        with self.db.session_scope() as session:
            categories = session.query(schema.QuestionCategory).all()
            return [dict(title=category.title, questions=[
                dict(prompt=q.prompt, activity_id=q.activity_id, is_positive=q.is_positive,
                     text_often=q.text_often, text_sometimes=q.text_sometimes, text_rarely=q.text_rarely)
                for q in category.questions
            ]) for category in categories if category.questions]

    def new_question(self, category_id, question):
        with self.db.session_scope() as session:
            category = session.query(schema.QuestionCategory).filter(schema.QuestionCategory.category_id == category_id).one_or_none()
            if category is None:
                raise RequestApiException('Category not found')
            question.sortorder = len(category.questions)
            category.questions.append(question)

    def api_new_question(self, params):
        params = v.validate(self.new_question_schema, params)
        category_id = params.pop('category_id')
        question = schema.QuestionPrompt(**params)
        self.new_question(category_id, question)
        return dict(id=question.q_id, prompt=question.prompt, category_id=question.category_id)

    def api_get_question(self, question_id):
        with self.db.session_scope() as session:
            question = session.query(schema.QuestionPrompt).filter(schema.QuestionPrompt.q_id == question_id).one_or_none()
            if question is None:
                raise RequestApiException("Question not found")
            return dict(id=question.q_id, prompt=question.prompt, text_sometimes=question.text_sometimes,
                        text_often=question.text_often, text_rarely=question.text_rarely,
                        activity_id=question.activity_id, is_positive=question.is_positive, category_id=question.category_id)

    def api_edit_question(self, question_id, params):
        params = v.validate(self.new_question_schema, params)
        with self.db.session_scope() as session:
            question = session.query(schema.QuestionPrompt).filter(schema.QuestionPrompt.q_id == question_id).one_or_none()
            if question is None:
                raise RequestApiException("Question not found")
            for key, val in params.items():
                setattr(question, key, val)
            return dict(id=question.q_id, prompt=question.prompt, category_id=question.category_id)