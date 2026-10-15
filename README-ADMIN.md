# HBBS Kraft – Verwaltung (admin.html)

## Heute (GitHub Pages)
- Inhalte: `content/projects.json`, `content/gallery.json`, `content/offer.json`; Bilder: `uploads/JJJJ/MM/*.webp`.
- Die Website (`assets/app.js`) lädt die JSON-Dateien beim Seitenaufruf (Fallback: `assets/data/demo.js`).
- `admin.html` (Footer-Link •••) schreibt über die GitHub REST API (Git-Data: blobs → tree → commit → ref) – **ein Commit pro „Veröffentlichen“**.
- Zugang: PIN (nur Sichtschutz) + fine-grained GitHub-Token (nur Repo `hbbs-demo`, *Contents: Read and write*), der nur im `localStorage` des Geräts liegt – nie im Repo.
- Nach dem Veröffentlichen baut GitHub Pages neu (~1–2 Min.).
- Bilder werden im Browser auf max. 1600 px verkleinert (WebP, Fallback JPEG 82 %).

## Später (eigene Domain, PHP-Hosting) – nicht deployed
Gleiches Datenformat behalten, nur die Schreibschicht tauschen:
1. `api/admin.php` mit Endpunkten `GET ?f=projects|gallery|offer` und `POST` (JSON + Multipart-Bilder).
2. Auth: Login mit Passwort (`password_hash` in `config.php` außerhalb des Webroots), PHP-Session + CSRF-Token, Rate-Limit.
3. Schreiben: `content/*.json` atomar (`file_put_contents` in tmp + `rename`), Bilder nach `uploads/` (MIME prüfen mit `finfo`, nur jpg/png/webp, neu kodieren mit GD/Imagick, max. 1600 px).
4. `.htaccess`: `uploads/` ohne PHP-Ausführung (`php_flag engine off`), `content/` nur lesbar.
5. In `admin.html` die Funktion `commit()` durch `fetch('api/admin.php', {method:'POST', body: FormData})` ersetzen und den Token-Schritt durch Passwort-Login; die Website (`app.js`) bleibt unverändert.
6. Änderungen sind dann sofort live (kein Pages-Build).
