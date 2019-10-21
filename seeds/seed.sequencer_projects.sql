BEGIN;

TRUNCATE sequencer_projects RESTART IDENTITY CASCADE;

INSERT INTO sequencer_projects (title, user_id)
VALUES
  ('project-1', '1'), 
  ('another project', '2'),
  ('third-roject', '1');

COMMIT;