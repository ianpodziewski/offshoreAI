CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    doc_name TEXT NOT NULL,
    doc_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

