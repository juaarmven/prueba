INSERT INTO User (id, user_type) VALUES
('U001', 'Registered'),
('U002', 'Registered'),
('U003', 'Registered'),
('U004', 'Guest'),
('U005', 'Guest');

INSERT INTO RegisteredUser (id, name, last_name, age, location, profile_image, email, password, phone, username)
VALUES
('U001', 'Carlos', 'Martínez', 28, 'Madrid', NULL, 'carlos@example.com', 'pass123', 612345678, 'carlosm'),
('U002', 'Lucía', 'Gómez', 31, 'Barcelona', NULL, 'lucia@example.com', 'lucia321', 698765432, 'luciag'),
('U003', 'Marco', 'Rossi', 26, 'Milán', NULL, 'marco@example.com', 'marco777', 345678901, 'marcor');

INSERT INTO GuestUser (id) VALUES
('U004'),
('U005');

INSERT INTO Path (name, route, origin, end, difficulty, duration, distance, average_velocity, status, elevation_gain, is_public, date, path_photo, created_by)
VALUES
('Ruta del Bosque', '["Punto A","Punto B","Punto C"]', 'Calle Roble', 'Calle Pino', 'Easy', '01:30:00', 5.2, 3.4, 'Optimal', 120, TRUE, '2024-05-10 10:00:00', NULL, 'U001'),

('Sendero Montañoso', '["Inicio","Mirador","Cumbre"]', 'Av. Montaña', 'Pico Alto', 'Difficult', '03:45:00', 12.8, 3.1, 'Requires Maintenance', 850, FALSE, '2024-06-02 08:30:00', NULL, 'U002'),

('Camino del Río', '["Puente","Ribera","Cascada"]', 'Calle Agua', 'Cascada Azul', 'Intermediate', '02:10:00', 7.4, 3.5, 'Sufficient', 300, TRUE, '2024-07:15 09:15:00', NULL, 'U003');


INSERT INTO Meteorology (climate, temperature, wind, path_id)
VALUES
('Sunny', 22.5, 5.2, 1),
('Cloudy', 18.1, 3.0, 2),
('Raining', 15.0, 7.4, 3);


INSERT INTO Rating (score, description, path_id)
VALUES
('5', 'Ruta muy bonita y fácil.', 1),
('4', 'Buen camino, algo resbaladizo.', 3),
('2', 'Demasiado difícil y mal señalizado.', 2),
('3', 'Experiencia aceptable.', 1);


INSERT INTO Confirmation (confirmation_type, time_confirmation, guest_id, path_id)
VALUES
('True', '2024-05-10 11:00:00', 'U004', 1),
('False', '2024-06-02 09:00:00', 'U005', 2),
('True', '2024-07-15 10:00:00', 'U004', 3);


INSERT INTO UserFriends (user_id, friend_id)
VALUES
('U001', 'U002'),
('U002', 'U003'),
('U003', 'U001');


INSERT INTO UserLikesPath (user_id, path_id)
VALUES
('U001', 1),
('U001', 3),
('U002', 2),
('U003', 1);
