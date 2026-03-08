-- Enforce unique reusable document names in catalog
-- Run duplicate check first to avoid migration failure
SELECT name, COUNT(*) AS duplicate_count
FROM document_catalog
GROUP BY name
HAVING COUNT(*) > 1;

-- If the query above returns rows, clean duplicates first, then run this:
ALTER TABLE document_catalog
ADD CONSTRAINT uq_document_catalog_name UNIQUE (name);
