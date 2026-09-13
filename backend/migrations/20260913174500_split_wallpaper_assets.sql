ALTER TABLE wallpapers DROP CONSTRAINT wallpapers_pkey;
ALTER TABLE wallpapers ADD COLUMN id SERIAL PRIMARY KEY;

CREATE TABLE contest_wallpaper (
    contest_id   TEXT    PRIMARY KEY,
    wallpaper_id INTEGER NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE
);

INSERT INTO contest_wallpaper (contest_id, wallpaper_id)
SELECT contest_id, id FROM wallpapers;

ALTER TABLE wallpapers DROP COLUMN contest_id;

CREATE TABLE system_settings (
    id                   BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    default_wallpaper_id INTEGER REFERENCES wallpapers(id) ON DELETE SET NULL
);

INSERT INTO system_settings (id) VALUES (TRUE);
