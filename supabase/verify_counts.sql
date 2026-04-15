SELECT 'vendors' as tbl, count(*) as cnt FROM vendors
UNION ALL SELECT 'venues', count(*) FROM venues
UNION ALL SELECT 'venue_images', count(*) FROM venue_images
UNION ALL SELECT 'speakers', count(*) FROM speakers
UNION ALL SELECT 'sponsors', count(*) FROM sponsors
UNION ALL SELECT 'services', count(*) FROM services
ORDER BY tbl;
