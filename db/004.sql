CREATE SEQUENCE seq_activities;
create table ACTIVITIES (
  activity_id int not null DEFAULT nextval('seq_activities'),
  name varchar(255) not null,

  PRIMARY KEY(activity_id)
);

CREATE SEQUENCE seq_steps;

create table ACTIVITY_STEPS (
  step_id int not null default nextval('seq_steps'),
  step_no int not null,
  activity int not null,
  title varchar(255) not null,

  PRIMARY KEY (step_id),
  FOREIGN KEY (activity) REFERENCES ACTIVITIES(activity_id)
);

create UNIQUE INDEX idx_steps_step_no ON ACTIVITY_STEPS(step_no, activity);

create sequence seq_widgets;

create table STEP_WIDGETS (
  widget_id int not null default nextval('seq_widgets'),
  type varchar(255) not null,
  data text,
  PRIMARY KEY (widget_id)
);

create table widget_map (
  step_id int not null,
  widget_id int not null,
  sortorder int not null,
  PRIMARY KEY (step_id, sortorder),
  FOREIGN KEY (step_id) REFERENCES ACTIVITY_STEPS(step_id),
  FOREIGN KEY (widget_id) REFERENCES STEP_WIDGETS(widget_id)
);
