CREATE TABLE IF NOT EXISTS questions (
  id INT NOT NULL AUTO_INCREMENT,
  certificate_id INT NULL,
  question_no INT NULL,
  question_text TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  explanation TEXT NULL,
  is_fatal TINYINT(1) NOT NULL DEFAULT 0,
  level VARCHAR(20) NOT NULL DEFAULT 'medium',
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_questions_certificate_id (certificate_id),
  INDEX idx_questions_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS question_options (
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_key ENUM('A', 'B', 'C', 'D') NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_question_option_key (question_id, option_key),
  INDEX idx_question_options_question_id (question_id),
  CONSTRAINT fk_question_options_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
