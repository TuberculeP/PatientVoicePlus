CREATE TABLE retours_clients (
id UUID PRIMARY KEY,
etablissement_id INT NOT NULL,
message_original TEXT,
message_anonymise TEXT,
analyse TEXT,
tags TEXT[],
gravite VARCHAR(10),
audit_level VARCHAR(20),
in_quota BOOLEAN,
has_pii BOOLEAN,
needs_human_review BOOLEAN,
created_at TIMESTAMP DEFAULT NOW(),
reviewed_at TIMESTAMP,
reviewer_notes TEXT
);

CREATE INDEX idx_etab_date ON retours_clients(etablissement_id, created_at);
CREATE INDEX idx_tags ON retours_clients USING GIN(tags);
