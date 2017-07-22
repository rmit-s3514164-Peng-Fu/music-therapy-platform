drop table widget_map;
drop table step_widgets;

create table STEP_WIDGETS (
  widget_id int not null default nextval('seq_widgets'),
  widget_no int not null,
  step_id int not null,
  type varchar(255) not null,
  data text,
  PRIMARY KEY (widget_id),
  FOREIGN KEY (step_id) REFERENCES ACTIVITY_STEPS(step_id)
);

create UNIQUE INDEX idx_widgets_widget_no ON STEP_WIDGETS(widget_no, step_id);