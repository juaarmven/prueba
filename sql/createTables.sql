
-- Clase base User
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('Registered', 'Guest') NOT NULL
);


-- RegisteredUser extiende User
CREATE TABLE RegisteredUser (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
    location VARCHAR(255),
    profile_image VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    phone BIGINT,
    username VARCHAR(255),
    FOREIGN KEY (id) REFERENCES User(id)
);


-- GuestUser extiende User
CREATE TABLE GuestUser (
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES User(id)
);


-- Tabla Path
CREATE TABLE Path (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    route TEXT,
    origin VARCHAR(255),
    end VARCHAR(255),
    difficulty ENUM('Easy', 'Intermediate', 'Difficult'),
    duration TIME,
    distance FLOAT,
    average_velocity FLOAT,
    status ENUM('Optimal', 'Sufficient', 'Requires Maintenance'),
    elevation_gain FLOAT,
    is_public BOOLEAN,
    date DATETIME,
    path_photo BLOB,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES RegisteredUser(id)
);

-- Meteorology asociada a Path
CREATE TABLE Meteorology (
    id INT AUTO_INCREMENT PRIMARY KEY,
    climate ENUM('Sunny', 'Raining', 'Windy', 'Cloudy', 'Thunderstorm', 'Partly Cloudy'),
    temperature FLOAT,
    wind FLOAT,
    path_id INT,
    FOREIGN KEY (path_id) REFERENCES Path(id)
);

-- Rating asociada a Path
CREATE TABLE Rating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    score ENUM('1', '2', '3', '4', '5'),
    description TEXT,
    path_id INT,
    user_id INT,
    FOREIGN KEY (path_id) REFERENCES Path(id),
    FOREIGN KEY (user_id) REFERENCES RegisteredUser(id)
);


-- Confirmations hechas por GuestUser
CREATE TABLE Confirmation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    confirmation_type ENUM('True', 'False'),
    time_confirmation DATETIME,
    guest_id INT,
    path_id INT,
    FOREIGN KEY (guest_id) REFERENCES GuestUser(id),
    FOREIGN KEY (path_id) REFERENCES Path(id)
);


CREATE TABLE UserFriends (
    user_id INT,
    friend_id INT,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES RegisteredUser(id),
    FOREIGN KEY (friend_id) REFERENCES RegisteredUser(id)
);

CREATE TABLE UserLikesPath (
    user_id INT,
    path_id INT,
    PRIMARY KEY (user_id, path_id),
    FOREIGN KEY (user_id) REFERENCES RegisteredUser(id),
    FOREIGN KEY (path_id) REFERENCES Path(id)
);
