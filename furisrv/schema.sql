-- furisrv database schema

CREATE TABLE IF NOT EXISTS Users (
  Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  Email TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Name TEXT NOT NULL
);

CREATE INDEX UserEmailIndex ON Users ( Email );

CREATE TABLE IF NOT EXISTS Devices (
  Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  Password TEXT NOT NULL,
  OwnerId INTEGER NOT NULL,
  Name TEXT NOT NULL,
  IsOnline INTEGER NOT NULL DEFAULT 0,
  UNIQUE ( OwnerId, Name ),
  FOREIGN KEY ( OwnerId )
    REFERENCES Users ( Id )
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Sensors (
  Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  DeviceId INTEGER NOT NULL,
  Name INTEGER NOT NULL,
  Value TEXT NULL,
  UNIQUE ( DeviceId, Name ),
  FOREIGN KEY ( DeviceId )
    REFERENCES Devices ( Id )
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Controls (
  Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  DeviceId INTEGER NOT NULL,
  Name INTEGER NOT NULL,
  UNIQUE ( DeviceId, Name ),
  FOREIGN KEY ( DeviceId )
    REFERENCES Devices ( Id )
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Scripts (
  Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  Script TEXT NOT NULL,
  Name TEXT NOT NULL,
  IsEnabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ScriptDevices (
  ScriptId INTEGER NOT NULL,
  DeviceId INTEGER NOT NULL,
  PRIMARY KEY ( ScriptId, DeviceId ),
  FOREIGN KEY ( ScriptId )
    REFERENCES Scripts ( Id )
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY ( DeviceId )
    REFERENCES Devices ( Id )
    ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO Users ( Id, Email, Password, Name ) VALUES ( 1, '1234', '$2b$10$aR4k3riR.jQLIecoi31tFu9ZDG.woqYsUr7SYnPvmXxvgzE46LW56', 'ikh' );