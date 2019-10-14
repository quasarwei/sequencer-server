BEGIN;

TRUNCATE sequencer_users RESTART IDENTITY CASCADE;

INSERT INTO sequencer_users (user_name, email, password)
VALUES
  ('testuser-1', 'testuser-1@email.com', 'Password123!'),
  ('sampleuser', 'sampleuser@emai.com', 'Password123!abc');

COMMIT;