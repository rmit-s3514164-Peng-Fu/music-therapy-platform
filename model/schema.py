# coding: utf-8
from sqlalchemy import Column, ForeignKey, Integer, String, text, Boolean, DateTime, Text, Index, Table, func
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from passlib.handlers.sha2_crypt import sha256_crypt
import datetime

from model.constants import CHAT_THRESHOLD

Base = declarative_base()
metadata = Base.metadata


class Activity(Base):
    __tablename__ = 'activities'

    activity_id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)

    steps = relationship('ActivityStep', backref='activities', order_by='ActivityStep.step_no')


class ActivityStep(Base):
    __tablename__ = 'activity_steps'
    __table_args__ = (
        Index('idx_steps_step_no', 'step_no', 'activity', unique=True),
    )

    step_id = Column(Integer, primary_key=True)
    step_no = Column(Integer, nullable=False)
    activity = Column(ForeignKey('activities.activity_id'), nullable=False)
    title = Column(String(255), nullable=False)

    r_activity = relationship('Activity')

    widgets = relationship('StepWidget', backref='activity_steps', order_by='StepWidget.widget_no')


class Emo(Base):
    __tablename__ = 'emotions'
    e_id = Column(Integer, primary_key=True)
    e_name = Column(String(255))
    count = Column(Integer)


class MessageInbox(Base):
    __tablename__ = 'message_inbox'

    owner = Column(ForeignKey('users.u_id'), primary_key=True)
    partner = Column(ForeignKey('users.u_id'), primary_key=True)
    m_id = Column(ForeignKey('private_messages.id'), primary_key=True)
    received = Column(DateTime, server_default=func.current_timestamp())
    opened = Column(DateTime)

    r_owner = relationship('User', foreign_keys=[owner])
    r_partner = relationship('User', foreign_keys=[partner])
    message = relationship('PrivateMessage')

    @property
    def unread(self):
        return self.opened is None

    @unread.setter
    def unread(self, val):
        if val:
            self.opened = None


class PrivateMessage(Base):
    __tablename__ = 'private_messages'

    id = Column(Integer, primary_key=True)
    user_from = Column(ForeignKey('users.u_id'))
    content = Column(String(1024))
    created = Column(DateTime, server_default=func.current_timestamp())

    owner = relationship('User')


class Playlist(Base):
    __tablename__ = 'playlist'

    l_id = Column(Integer, primary_key=True)
    l_name = Column(String(255))
    l_description = Column(String(2000))
    u_id = Column(Integer, ForeignKey('users.u_id'), nullable=False)
    tracks = relationship('Track', backref='playlist', cascade="all, delete-orphan")


class Track(Base):
    __tablename__ = 'track'

    t_id = Column(Integer, primary_key=True)
    t_title = Column(String(255))
    t_author = Column(String(255))
    t_url = Column(String(255))
    l_id = Column(ForeignKey('playlist.l_id'), nullable=False)


class Profile(Base):
    __tablename__ = 'profile'

    p_id = Column(Integer, primary_key=True)
    p_testresult = Column(String(255))
    p_suggestion = Column(String(255))
    p_activity_record = Column(String(255))
    u_id = Column(ForeignKey('users.u_id'))
    q_id = Column(Integer)

    u = relationship('User')


class QuestionCategory(Base):
    __tablename__ = 'question_categories'

    category_id = Column(Integer, primary_key=True)
    title = Column(String(200))

    questions = relationship('QuestionPrompt', backref='question_categories', order_by='QuestionPrompt.sortorder')


class QuestionPrompt(Base):
    __tablename__ = 'question_prompts'
    __table_args__ = (
        Index('idx_question_order', 'category_id', 'sortorder', unique=True),
    )

    q_id = Column(Integer, primary_key=True)
    category_id = Column(ForeignKey('question_categories.category_id'), nullable=False)
    activity_id = Column(ForeignKey('activities.activity_id'))
    sortorder = Column(Integer, nullable=False)
    is_positive = Column(Boolean, default=True, nullable=False)
    prompt = Column(String(1000))
    text_often = Column(String(2000))
    text_sometimes = Column(String(2000))
    text_rarely = Column(String(2000))


class StepWidget(Base):
    __tablename__ = 'step_widgets'

    widget_id = Column(Integer, primary_key=True)
    widget_no = Column(Integer, nullable=False)
    step_id = Column(ForeignKey('activity_steps.step_id'), nullable=False)
    type = Column(String(255), nullable=False)
    data = Column(Text)


class User(Base):
    __tablename__ = 'users'

    u_id = Column(Integer, primary_key=True)
    u_email = Column(String(255))
    u_password = Column(String(255))
    u_lastname = Column(String(255))
    u_firstname = Column(String(255))
    u_gender = Column(String(6))
    u_genre = Column(String(255))
    u_age = Column(Integer)
    u_type = Column(String(255))
    gauth_token = Column(String(255))
    fb_token = Column(String(255))
    u_isconfirmed = Column(Boolean, default=False, nullable=False)
    u_isadmin = Column(Boolean, default=False, nullable=False)
    last_positive_response = Column(DateTime, default=None)
    allow_chat = Column(Boolean, default=False)
    playlists = relationship('Playlist', backref='users', cascade="all, delete-orphan")

    def set_password(self, password):
        self.u_password = sha256_crypt.encrypt(password)

    def password_verify(self, password):
        return sha256_crypt.verify(password, self.u_password)

    @classmethod
    def chat_available_filter(cls):
        return [cls.allow_chat == True, cls.last_positive_response > (datetime.datetime.now() - CHAT_THRESHOLD)]

    @property
    def chat_available(self):
        return self.allow_chat and self.last_positive_response > (datetime.datetime.now() - CHAT_THRESHOLD)

    @property
    def full_name(self):
        if self.u_firstname and self.u_lastname:
            return '%s %s' % (self.u_firstname, self.u_lastname)
        else:
            return '%s%s' % (self.u_firstname or '', self.u_lastname or '')
