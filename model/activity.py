from model.schema import Activity, ActivityStep, StepWidget
from utils import voluptuous_ext as v


class ActivityManager(object):

    valid_types = ['title', 'subtitle', 'text', 'quote', 'audio', 'save', 'song']

    new_widget_schema = {
        v.Required('type'): v.In(valid_types),
        v.Required('data'): v.String()
    }

    new_activity_schema = {
        v.Required('name'): v.String()
    }

    new_step_schema = {
        v.Required('title'): v.String()
    }

    edit_widget_schema = {
        v.Optional('data', default=None): v.String(),
        v.Optional('move', default=None): v.In(['up', 'down'])
    }

    def __init__(self, db):
        self.db = db

    def new_activity(self, name):
        activity = Activity(name=name)
        with self.db.session_scope() as session:
            session.add(activity)
            session.commit()
            return dict(name=activity.name, id=activity.activity_id)

    def api_new_activity(self, params):
        params = v.validate(self.new_activity_schema, params)
        return self.new_activity(params['name'])

    def api_all_activities(self):
        with self.db.session_scope() as session:
            return [dict(name=activity.name, id=activity.activity_id) for activity in  session.query(Activity).all()]

    def add_step(self, activity, title, step_no):
        step = ActivityStep(title=title, r_activity=activity, step_no=step_no)
        with self.db.session_scope() as session:
            session.add(step)
        return step

    def add_widget(self, activity_id, step_no, type, data):
        step_no -= 1  # 0 based index
        widget = StepWidget(type=type, data=data)
        with self.db.session_scope() as session:

            step = session.query(ActivityStep).filter(ActivityStep.step_no == step_no, ActivityStep.activity == activity_id).one_or_none()
            if step is None:
                raise Exception("Invalid step")
            widget.widget_no = len(step.widgets)
            step.widgets.append(widget)
        return widget

    def api_add_widget(self, activity_id, step_id, params):
        params = v.validate(self.new_widget_schema, params)
        widget = self.add_widget(activity_id, step_id, params['type'], params['data'])
        return dict(type=widget.type, data=widget.data, id=widget.widget_id)

    def get_full_activity(self, activity_id):
        with self.db.session_scope() as session:
            q = session.query(Activity).filter(Activity.activity_id == activity_id).one_or_none()
            return q

    def get_steps(self, activity_id):
        with self.db.session_scope() as session:
            activity = session.query(Activity).filter(Activity.activity_id == activity_id).one_or_none()
            if activity is None:
                raise Exception("Couldn't find activity")
            return activity.steps

    def api_get_steps(self, activity_id):
        return [dict(title=step.title, id=step.step_id, step_no=step.step_no+1) for step in self.get_steps(activity_id)]

    def new_step(self, activity_id, title):
        with self.db.session_scope() as session:
            activity = session.query(Activity).filter(Activity.activity_id == activity_id).one_or_none()
            if activity is None:
                raise Exception("Couldn't find activity")
            step = ActivityStep(step_no=len(activity.steps), title=title)
            activity.steps.append(step)
            return step

    def api_new_step(self, activity_id, params):
        params = v.validate(self.new_step_schema, params)
        return dict(id=self.new_step(activity_id, params['title']).step_no+1)

    def get_activity_step(self, activity_id, step_no):
        with self.db.session_scope() as session:
            activity = session.query(Activity).filter(Activity.activity_id == activity_id).one_or_none()
            if activity is None:
                raise Exception("Couldn't find the activity!")
            if len(activity.steps) == 0:
                return dict(message='This Activity has no steps!')

            if len(activity.steps) < step_no - 1:
                raise Exception("Couldn't find the activity!")
            step = activity.steps[step_no - 1]
            has_next = step_no < len(activity.steps)
            has_previous = step_no > 1
            return dict(has_next=has_next, has_previous=has_previous, widgets=[
                dict(type=widget.type, data=widget.data, id=widget.widget_id)
                for widget in step.widgets
            ])

    def set_widget_content(self, widget_id, data):
        with self.db.session_scope() as session:
            widget = session.query(StepWidget).filter(StepWidget.widget_id == widget_id).one_or_none()
            if widget is None:
                raise Exception("Couldn't find widget")
            widget.data = data

    def move_widget(self, widget_id, direction):
        with self.db.session_scope() as session:
            widget = session.query(StepWidget).filter(StepWidget.widget_id == widget_id).one_or_none()
            if widget is None:
                raise Exception("Couldn't find widget")
            other_widget_no = widget.widget_no + (direction == 'up' and -1 or 1)
            other_widget = session.query(StepWidget).filter(StepWidget.widget_no == other_widget_no, StepWidget.step_id == widget.step_id).one_or_none()
            if other_widget is None:
                raise Exception("Can't move this widget")
            widget_no = widget.widget_no
            widget.widget_no = -1
            session.commit()
            other_widget.widget_no = widget_no
            session.commit()
            widget.widget_no = other_widget_no


    def api_edit_widget(self, widget_id, params):
        params = v.validate(self.edit_widget_schema, params)
        if params['data']:
            self.set_widget_content(widget_id, params['data'])
        if params['move']:
            self.move_widget(widget_id, params['move'])
        return True

    def delete_widget(self, widget_id):
        with self.db.session_scope() as session:
            widget = session.query(StepWidget).filter(StepWidget.widget_id == widget_id).one_or_none()
            if widget is None:
                raise Exception("Couldn't find widget")
            session.delete(widget)

    def api_delete_widget(self, widget_id):
        self.delete_widget(widget_id)
        return True
