create SEQUENCE seq_categories;
CREATE SEQUENCE seq_questions;

create table question_categories(
  category_id int not null default nextval('seq_categories'),
  title varchar(200) not null,
  PRIMARY KEY (category_id)
);

create table question_prompts(
  q_id int not null default nextval('seq_questions'),
  category_id int not null,
  activity_id int,
  sortorder int not null,
  is_positive boolean not null default true,
  prompt varchar(1000) not null,
  text_often varchar(2000) not null,
  text_sometimes varchar(2000) not null,
  text_rarely varchar(2000) not null,

  PRIMARY KEY (q_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
);

create UNIQUE INDEX idx_question_order ON question_prompts(category_id, sortorder);
