CREATE TABLE IF NOT EXISTS EMAILS (
    EMAIL TEXT PRIMARY KEY,
    EMAIL_VERIFIED BOOLEAN DEFAULT FALSE,
    EMAIL_VERIFICATION_CODE TEXT,
    MONITOR_STATUS BOOLEAN DEFAULT FALSE,
    MONITOR_PRODUCTION BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS SOLAR_SYSTEMS (
    UUID TEXT PRIMARY KEY,
    DATA_SOURCE TEXT,
    SYSTEM_ID TEXT,
    STATUS TEXT,
    LAST_STATUS TEXT,
    LAST_ENERGY_AT BOOLEAN,
    ALLOW_ANALYTICS BOOLEAN,
    INSTALLER TEXT,
    LO_STATE TEXT,
    LO_CITY TEXT,
    ENPHASE_ACCESS_TOKEN TEXT,
    ENPHASE_REFRESH_TOKEN TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS IDX_DATA_SOURCE_SYSTEM_ID ON SOLAR_SYSTEMS (DATA_SOURCE, SYSTEM_ID);

CREATE TABLE IF NOT EXISTS EMAIL_SYSTEM_MAPPING (
    UUID TEXT PRIMARY KEY,
    EMAIL TEXT,
    SOLAR_SYSTEM TEXT,
    FOREIGN KEY (EMAIL) REFERENCES EMAILS (EMAIL) ON DELETE CASCADE,
    FOREIGN KEY (SOLAR_SYSTEM) REFERENCES SOLAR_SYSTEMS (UUID) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS IDX_EMAIL_SYSTEM ON EMAIL_SYSTEM_MAPPING (EMAIL, SOLAR_SYSTEM);
