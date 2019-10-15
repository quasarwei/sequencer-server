BEGIN;

TRUNCATE sequencer_users RESTART IDENTITY CASCADE;

INSERT INTO sequencer_users (user_name, email, password)
VALUES
  ('testuser-1', 'testuser-1@email.com', '$2a$12$zVrhNuJpMd0nzeQL1Wc01O1/22eH0W3.E.6.apRXDvR3vrWBv7oOG'), /*Password123!*/
  ('sampleuser', 'sampleuser@emai.com', '$2a$12$sO2CW5f/jihsGxOqb.bGKe7rFBORggswNKgcoCRVDtP438kzd08J.'); /*Password123!abc*/

COMMIT;