-- Menyiapkan database dan pengguna untuk Senada Studio di MySQL/MariaDB (XAMPP).
-- Jalankan sebagai root: lewat phpMyAdmin (tab SQL) atau
--   C:\xampp\mysql\bin\mysql.exe -u root < setup-db.sql
-- GANTI_PASSWORD harus sama dengan yang dipakai di DATABASE_URL pada server/.env.

CREATE DATABASE IF NOT EXISTS senada_studio        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Database bayangan: dipakai Prisma Migrate hanya saat pengembangan (npm run db:migrate).
CREATE DATABASE IF NOT EXISTS senada_studio_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'senada'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD';
GRANT ALL ON senada_studio.*        TO 'senada'@'localhost';
GRANT ALL ON senada_studio_shadow.* TO 'senada'@'localhost';
FLUSH PRIVILEGES;
