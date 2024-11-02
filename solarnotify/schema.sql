-- Emails table
CREATE TABLE IF NOT EXISTS EMAILS (
    EMAIL TEXT PRIMARY KEY,
    EMAIL_VERIFIED BOOLEAN,
    EMAIL_VERIFICATION_CODE TEXT,
    MONITOR_STATUS TEXT,
    MONITOR_PRODUCTION TEXT
);

-- Systems table
CREATE TABLE IF NOT EXISTS SOLAR_SYSTEMS (
    UUID TEXT PRIMARY KEY,
    DATA_SOURCE TEXT,
    SYSTEM_ID TEXT,
    STATUS TEXT,
    LAST_STATUS TEXT,
    PRODUCTION_ALERT BOOLEAN,
    ALLOW_ANALYTICS BOOLEAN
);

-- Email_System_Mapping table
CREATE TABLE IF NOT EXISTS EMAIL_SYSTEM_MAPPING (
    UUID TEXT PRIMARY KEY,
    EMAIL TEXT,
    SOLAR_SYSTEM TEXT,
    FOREIGN KEY (EMAIL) REFERENCES EMAILS (EMAIL) ON DELETE CASCADE,
    FOREIGN KEY (SOLAR_SYSTEM) REFERENCES SOLAR_SYSTEMS (UUID) ON DELETE CASCADE
);
