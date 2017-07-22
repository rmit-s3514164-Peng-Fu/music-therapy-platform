CREATE TABLE Users
(
U_ID int NOT NULL DEFAULT NEXTVAL(seq_users),
U_Email varchar(255),
U_Password varchar(255),
U_LastName varchar(255),
U_FirstName varchar(255),
U_Age int,
U_Type varchar(255),
gauth_token varchar(255),
fb_token varchar(255),
  U_isconfirmed BOOLEAN default FALSE not NULL ,
PRIMARY KEY (U_ID)
);
CREATE TABLE PlayList
(
L_ID int NOT NULL,
L_soundName varchar(255),
L_MusicURL varchar(255),
U_ID int,
PRIMARY KEY (L_ID),
FOREIGN KEY (U_ID) REFERENCES Users(U_ID)
);

CREATE TABLE Profile
(
P_ID int NOT NULL,
P_TestResult varchar(255),
P_Suggestion varchar(255),
U_ID int,
Q_ID int,
PRIMARY KEY (P_ID),
FOREIGN KEY (U_ID) REFERENCES Users(U_ID)
);
CREATE TABLE Questions
(
Q_ID int NOT NULL,
Q_Question varchar(255),
Q_Category varchar(255),
Q_Type varchar(255),
PRIMARY KEY (Q_ID)
);
CREATE TABLE Answer
(
A_ID int NOT NULL,
Q_ID int,
A_Response varchar(255),
A_Text varchar(255),
P_ID int,
PRIMARY KEY (Q_ID),
FOREIGN KEY (Q_ID) REFERENCES Questions(Q_ID),
FOREIGN KEY (P_ID) REFERENCES Profile(P_ID)
);
