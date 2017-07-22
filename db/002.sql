CREATE SEQUENCE seq_users;

ALTER TABLE users ALTER COLUMN u_id SET DEFAULT nextval('seq_users');

CREATE SEQUENCE seq_messages;

CREATE TABLE private_messages (
  id INTEGER NOT NULL DEFAULT nextval('seq_messages'),
  user_from INTEGER NOT NULL,
  content VARCHAR(1024) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (user_from) REFERENCES users(u_id)

);


CREATE TABLE message_inbox (
  owner INTEGER NOT NULL,
  partner INTEGER NOT NULL,
  m_id INTEGER NOT NULL,
  received TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened TIMESTAMP DEFAULT NULL,

  PRIMARY KEY (owner, m_id),
  FOREIGN KEY (owner) REFERENCES users(u_id),
  FOREIGN KEY (partner) REFERENCES users(u_id),
  FOREIGN KEY (m_id) REFERENCES private_messages(id)
);