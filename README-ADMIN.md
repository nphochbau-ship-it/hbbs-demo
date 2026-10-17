# HBBS Kraft – Verwaltung

- Inhalte: `content/projects.json`, `content/gallery.json`, `content/offer.json`; eigene Fotos in `assets/img/hbbs/`, neue Uploads in `uploads/JJJJ/MM/*-480|960|1600.webp`.
- Die Website (`assets/app.js`) lädt die JSON-Dateien beim Seitenaufruf.
- Die Verwaltung ist nicht verlinkt und nicht in `sitemap.xml`. Die Seite ist vollständig verschlüsselt (AES-256-GCM, Schlüssel per PBKDF2-SHA256 mit 600.000 Iterationen aus dem Passwort abgeleitet). Ohne Passwort ist nur ein Anmeldefeld sichtbar; das Passwort steht nirgends im Repository.
- Schreiben erfolgt über die GitHub-API mit einem fine-grained Token (nur dieses Repo, *Contents: Read and write*). Der Token wird auf dem Gerät nur verschlüsselt (mit dem Passwort-Schlüssel) im `localStorage` abgelegt.
- Angebot der Woche: wird nur mit Enddatum (`validUntil`) und innerhalb von `validFrom`–`validUntil` (Zeitzone Europe/Berlin) angezeigt und danach automatisch ausgeblendet. Bedingungen erscheinen automatisch im Kleingedruckten.
- Nach dem Veröffentlichen baut GitHub Pages neu (~1–2 Min.).
- Quelltext der Verwaltung und Build-Skript liegen außerhalb des öffentlichen Repos.
