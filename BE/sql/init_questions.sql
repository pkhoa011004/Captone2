CREATE TABLE IF NOT EXISTS questions (
  question_id INT NOT NULL,
  question_text TEXT NOT NULL,
  image VARCHAR(255) NULL,
  is_fatal TINYINT(1) NOT NULL DEFAULT 0,
  explanation TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id)
);

CREATE TABLE IF NOT EXISTS question_options (
  option_id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (option_id),
  INDEX idx_question_options_question_id (question_id),
  CONSTRAINT fk_question_options_question
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
