alter table users add column last_positive_response TIMESTAMP DEFAULT null;
alter table users add column allow_chat BOOLEAN default false;
