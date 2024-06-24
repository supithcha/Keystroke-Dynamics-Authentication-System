CREATE DATABASE IF NOT EXISTS user_account;
USE user_account;

DROP TABLE IF EXISTS user_account;
CREATE TABLE user_account (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    img_link VARCHAR(255),
    avg_CPM_user FLOAT,
    avg_UD_user FLOAT,
    avg_DU_user FLOAT,
    avg_CPM_pass FLOAT,
    avg_UD_pass FLOAT,
    avg_DU_pass FLOAT
);

INSERT INTO user_account (username, password, img_link) 
VALUES 
    ('Supithcha', 'Supithcha6488045', 'https://drive.google.com/file/d/1Cjm2BQt0uXh3Hu2nc4ZpAlYN5gqkl9zm/view?usp=drive_link'),
    ('Sasasuang', 'Sasasuang6488052', 'https://drive.google.com/file/d/1Cjm2BQt0uXh3Hu2nc4ZpAlYN5gqkl9zm/view?usp=drive_link'),
    ('Nisakorn', 'Nisakorn6488226', 'https://drive.google.com/file/d/1Cjm2BQt0uXh3Hu2nc4ZpAlYN5gqkl9zm/view?usp=drive_link');
