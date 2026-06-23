-- Enable pg_net for async HTTP calls from triggers.
-- pg_net installs into its own `net` schema (used by on_review_insert()).
create extension if not exists pg_net;
