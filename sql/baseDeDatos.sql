-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.5.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para bbp
CREATE DATABASE IF NOT EXISTS `bbp` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;
USE `bbp`;

-- Volcando estructura para tabla bbp.confirmation
CREATE TABLE IF NOT EXISTS `confirmation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `confirmation_type` enum('True','False') DEFAULT NULL,
  `time_confirmation` datetime DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `path_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `guest_id` (`guest_id`),
  KEY `path_id` (`path_id`),
  CONSTRAINT `confirmation_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guestuser` (`id`),
  CONSTRAINT `confirmation_ibfk_2` FOREIGN KEY (`path_id`) REFERENCES `path` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.confirmation: ~3 rows (aproximadamente)
DELETE FROM `confirmation`;
INSERT INTO `confirmation` (`id`, `confirmation_type`, `time_confirmation`, `guest_id`, `path_id`) VALUES
	(1, 'True', '2025-01-16 11:00:00', 4, 1),
	(2, 'False', '2025-01-16 12:30:00', 5, 2),
	(3, 'True', '2025-01-17 09:15:00', 4, 3);

-- Volcando estructura para tabla bbp.guestuser
CREATE TABLE IF NOT EXISTS `guestuser` (
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `guestuser_ibfk_1` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.guestuser: ~2 rows (aproximadamente)
DELETE FROM `guestuser`;
INSERT INTO `guestuser` (`id`) VALUES
	(4),
	(5);

-- Volcando estructura para tabla bbp.meteorology
CREATE TABLE IF NOT EXISTS `meteorology` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `climate` enum('Sunny','Raining','Windy','Cloudy','Thunderstorm','Partly Cloudy') DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `wind` float DEFAULT NULL,
  `path_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `path_id` (`path_id`),
  CONSTRAINT `meteorology_ibfk_1` FOREIGN KEY (`path_id`) REFERENCES `path` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.meteorology: ~3 rows (aproximadamente)
DELETE FROM `meteorology`;
INSERT INTO `meteorology` (`id`, `climate`, `temperature`, `wind`, `path_id`) VALUES
	(1, 'Sunny', 22.5, 5.2, 1),
	(2, 'Windy', 15, 18.4, 2),
	(3, 'Cloudy', 18.3, 7.1, 3);

-- Volcando estructura para tabla bbp.path
CREATE TABLE IF NOT EXISTS `path` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `route` text DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `end` varchar(255) DEFAULT NULL,
  `difficulty` enum('Easy','Intermediate','Difficult') DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `distance` float DEFAULT NULL,
  `average_velocity` float DEFAULT NULL,
  `status` enum('Optimal','Sufficient','Requires Maintenance') DEFAULT NULL,
  `elevation_gain` float DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
	`path_photo` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `path_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `registereduser` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.path: ~40 rows (aproximadamente)
DELETE FROM `path`;
INSERT INTO `path` (`id`, `name`, `route`, `origin`, `end`, `difficulty`, `duration`, `distance`, `average_velocity`, `status`, `elevation_gain`, `is_public`, `date`, `path_photo`, `created_by`) VALUES
	(1, 'Ruta del Río', 'Ruta junto al río con senderos naturales', 'Parque Norte', 'Puente Viejo', 'Easy', '01:30:00', 5.2, 3.5, 'Optimal', 120, 1, '2025-01-10 10:00:00', NULL, 1),
	(2, 'Montaña Azul', 'Sendero de montaña con vistas panorámicas', 'Refugio Central', 'Cima Azul', 'Difficult', '04:15:00', 12.8, 3, 'Requires Maintenance', 950, 1, '2025-01-12 08:30:00', NULL, 2),
	(3, 'Bosque Encantado', 'Camino circular por bosque frondoso', 'Área Recreativa', 'Área Recreativa', 'Intermediate', '02:20:00', 7.6, 3.2, 'Sufficient', 300, 0, '2025-01-15 09:45:00', NULL, 3),
	(4, 'Sendero del Lago', 'Camino bordeando el lago con tramos de madera', 'Centro Visitantes', 'Mirador del Lago', 'Easy', '01:10:00', 4.1, 3.5, 'Optimal', 80, 1, '2025-01-18 09:00:00', NULL, 1),
	(5, 'Ruta de los Acantilados', 'Ruta costera con desniveles y vistas al mar', 'Playa Norte', 'Faro Antiguo', 'Intermediate', '03:00:00', 9.4, 3.1, 'Sufficient', 420, 1, '2025-01-19 08:15:00', NULL, 2),
	(6, 'Ascenso Pico Rojo', 'Subida exigente con terreno rocoso', 'Base del Pico', 'Pico Rojo', 'Difficult', '05:30:00', 14.2, 2.6, 'Requires Maintenance', 1100, 1, '2025-01-20 07:00:00', NULL, 3),
	(7, 'Ruta Urbana Histórica', 'Recorrido por el casco antiguo de la ciudad', 'Plaza Mayor', 'Puerta Medieval', 'Easy', '00:55:00', 3, 3.3, 'Optimal', 40, 1, '2025-01-21 16:30:00', NULL, 1),
	(8, 'Camino del Barranco', 'Sendero estrecho junto a un barranco natural', 'Área de Picnic', 'Cascada Oculta', 'Intermediate', '02:45:00', 8.7, 3.2, 'Sufficient', 510, 0, '2025-01-22 10:00:00', NULL, 2),
	(9, 'Travesía Sierra Alta', 'Ruta larga atravesando la sierra', 'Puerto Viejo', 'Refugio Sur', 'Difficult', '06:45:00', 19.6, 2.9, 'Requires Maintenance', 1350, 1, '2025-01-23 06:30:00', NULL, 3),
	(10, 'Paseo del Bosque Sur', 'Camino sombreado ideal para principiantes', 'Entrada Sur', 'Área Recreativa', 'Easy', '01:20:00', 4.8, 3.6, 'Optimal', 95, 0, '2025-01-24 11:45:00', NULL, 1),
	(11, 'Ruta del Robledal', 'Sendero entre robles centenarios', 'Área Natural Norte', 'Fuente del Robledal', 'Easy', '01:25:00', 4.6, 3.4, 'Optimal', 110, 1, '2025-02-01 09:00:00', NULL, 1),
	(12, 'Camino del Castillo', 'Acceso histórico a un castillo medieval', 'Pueblo Antiguo', 'Castillo Viejo', 'Intermediate', '02:00:00', 6.2, 3.1, 'Sufficient', 280, 1, '2025-02-02 10:15:00', NULL, 2),
	(13, 'Ruta del Acueducto', 'Ruta siguiendo un antiguo acueducto romano', 'Puente Este', 'Arcos del Acueducto', 'Easy', '01:10:00', 3.9, 3.3, 'Optimal', 60, 1, '2025-02-03 11:30:00', NULL, 3),
	(14, 'Travesía Monte Blanco', 'Ruta de alta montaña con nieve ocasional', 'Refugio Norte', 'Cima Blanca', 'Difficult', '05:40:00', 15.6, 2.7, 'Requires Maintenance', 1200, 1, '2025-02-04 07:00:00', NULL, 1),
	(15, 'Paseo Fluvial Sur', 'Camino llano junto al río', 'Puente Sur', 'Área Deportiva', 'Easy', '00:50:00', 2.8, 3.4, 'Optimal', 35, 1, '2025-02-05 17:20:00', NULL, 2),
	(16, 'Ruta de los Viñedos', 'Camino rural entre viñedos y bodegas', 'Bodega Central', 'Mirador del Vino', 'Intermediate', '02:35:00', 8.1, 3.1, 'Sufficient', 320, 1, '2025-02-06 09:40:00', NULL, 3),
	(17, 'Ascenso Peña Alta', 'Subida exigente con tramos expuestos', 'Base Rocosa', 'Peña Alta', 'Difficult', '04:20:00', 11.9, 2.8, 'Requires Maintenance', 870, 1, '2025-02-07 08:10:00', NULL, 1),
	(18, 'Ruta del Humedal', 'Pasarelas de madera sobre zona húmeda protegida', 'Centro Interpretación', 'Observatorio de Aves', 'Easy', '01:05:00', 3.2, 3, 'Optimal', 20, 1, '2025-02-08 10:00:00', NULL, 2),
	(19, 'Circular Sierra Media', 'Ruta circular con desniveles moderados', 'Área de Picnic Norte', 'Área de Picnic Norte', 'Intermediate', '03:15:00', 9.7, 3, 'Sufficient', 410, 1, '2025-02-09 08:30:00', NULL, 3),
	(20, 'Camino del Faro Nuevo', 'Ruta costera con vistas al océano', 'Puerto Pesquero', 'Faro Nuevo', 'Easy', '01:45:00', 5.9, 3.4, 'Optimal', 140, 1, '2025-02-10 16:00:00', NULL, 1),
	(21, 'Ruta del Collado Oscuro', 'Sendero de montaña con zonas boscosas', 'Valle Sombrío', 'Collado Oscuro', 'Intermediate', '02:50:00', 8.8, 3.1, 'Sufficient', 530, 1, '2025-02-11 09:10:00', NULL, 2),
	(22, 'Travesía Pico del Viento', 'Ruta alpina con fuertes rachas de viento', 'Refugio Este', 'Pico del Viento', 'Difficult', '06:10:00', 18.3, 3, 'Requires Maintenance', 1400, 1, '2025-02-12 06:45:00', NULL, 3),
	(23, 'Paseo Verde Urbano', 'Ruta verde integrada en la ciudad', 'Parque Central', 'Jardín Botánico', 'Easy', '00:45:00', 2.5, 3.3, 'Optimal', 25, 1, '2025-02-13 18:00:00', NULL, 1),
	(24, 'Ruta del Antiguo Ferrocarril', 'Vía verde sobre antigua línea férrea', 'Estación Vieja', 'Túnel Largo', 'Intermediate', '03:40:00', 11.5, 3.1, 'Optimal', 190, 1, '2025-02-14 09:30:00', NULL, 2),
	(25, 'Ascenso Cerro Rojo', 'Ruta seca con terreno arcilloso', 'Camino Rural', 'Cerro Rojo', 'Intermediate', '02:30:00', 7.4, 3, 'Sufficient', 460, 1, '2025-02-15 10:20:00', NULL, 3),
	(26, 'Ruta de los Miradores', 'Ruta enlazando varios miradores naturales', 'Mirador Bajo', 'Mirador Alto', 'Easy', '01:35:00', 5, 3.2, 'Optimal', 210, 1, '2025-02-16 09:50:00', NULL, 1),
	(27, 'Travesía Barranco Grande', 'Ruta técnica por barranco profundo', 'Entrada Barranco', 'Salida Sur', 'Difficult', '04:45:00', 12.7, 2.9, 'Requires Maintenance', 990, 1, '2025-02-17 08:00:00', NULL, 2),
	(28, 'Camino del Molino', 'Ruta corta hasta un molino restaurado', 'Puente Antiguo', 'Molino Viejo', 'Easy', '00:40:00', 2.2, 3.3, 'Optimal', 30, 1, '2025-02-18 16:40:00', NULL, 3),
	(29, 'Ruta del Altiplano', 'Camino amplio por meseta elevada', 'Puerto Alto', 'Llano Central', 'Intermediate', '03:05:00', 9.9, 3.2, 'Sufficient', 350, 1, '2025-02-19 09:00:00', NULL, 1),
	(30, 'Gran Travesía del Norte', 'Ruta larga atravesando varias sierras', 'Refugio Norte', 'Refugio Oeste', 'Difficult', '07:30:00', 22.4, 3, 'Requires Maintenance', 1600, 1, '2025-02-20 06:00:00', NULL, 2),
	(31, 'Ruta Refugio–Valle Este', 'Descenso suave hacia el valle oriental', 'Refugio Central', 'Valle Este', 'Easy', '01:20:00', 4.5, 3.4, 'Optimal', 120, 1, '2025-03-01 09:00:00', NULL, 1),
	(32, 'Ruta Refugio–Bosque Alto', 'Sendero boscoso con desnivel moderado', 'Refugio Central', 'Bosque Alto', 'Intermediate', '02:30:00', 7.8, 3.1, 'Sufficient', 420, 1, '2025-03-02 08:30:00', NULL, 2),
	(33, 'Ruta Refugio–Collado Norte', 'Subida progresiva hasta el collado', 'Refugio Central', 'Collado Norte', 'Intermediate', '03:10:00', 9.6, 3, 'Sufficient', 610, 1, '2025-03-03 07:45:00', NULL, 3),
	(34, 'Ruta Refugio–Cumbre Sur', 'Ascenso exigente con tramos técnicos', 'Refugio Central', 'Cumbre Sur', 'Difficult', '04:40:00', 12.9, 2.8, 'Requires Maintenance', 980, 1, '2025-03-04 07:00:00', NULL, 1),
	(35, 'Ruta Refugio–Lago Frío', 'Camino alpino hasta lago de montaña', 'Refugio Central', 'Lago Frío', 'Easy', '01:50:00', 5.6, 3.2, 'Optimal', 210, 1, '2025-03-05 09:15:00', NULL, 2),
	(36, 'Ruta Norte al Mirador', 'Ruta ascendente desde el norte', 'Bosque Norte', 'Mirador Común', 'Intermediate', '02:10:00', 6.7, 3.1, 'Optimal', 390, 1, '2025-03-06 10:00:00', NULL, 3),
	(37, 'Ruta Sur al Mirador', 'Camino panorámico desde zona sur', 'Valle Sur', 'Mirador Común', 'Easy', '01:30:00', 4.2, 3.3, 'Optimal', 180, 1, '2025-03-07 16:20:00', NULL, 1),
	(38, 'Ruta Este al Mirador', 'Sendero de media montaña con vistas abiertas', 'Collado Este', 'Mirador Común', 'Intermediate', '02:45:00', 8.4, 3, 'Sufficient', 520, 1, '2025-03-08 09:40:00', NULL, 2),
	(39, 'Ruta Oeste al Mirador', 'Ruta larga con desnivel constante', 'Puerto Oeste', 'Mirador Común', 'Difficult', '04:15:00', 11.8, 2.9, 'Requires Maintenance', 870, 1, '2025-03-09 08:00:00', NULL, 3),
	(40, 'Ruta Circular al Mirador', 'Ruta circular con llegada al mirador', 'Área Recreativa', 'Mirador Común', 'Easy', '01:40:00', 5.1, 3.2, 'Optimal', 240, 1, '2025-03-10 10:30:00', NULL, 1);

-- Volcando estructura para tabla bbp.rating
CREATE TABLE IF NOT EXISTS `rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score` float DEFAULT NULL,
  `description` text DEFAULT NULL,
  `path_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `path_id` (`path_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`path_id`) REFERENCES `path` (`id`),
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `registereduser` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.rating: ~5 rows (aproximadamente)
DELETE FROM `rating`;
INSERT INTO `rating` (`id`, `score`, `description`, `path_id`, `user_id`) VALUES
	(1, 5, 'Buena ruta', 1, 13),
	(2, 5, 'Muy buena ruta', 2, 13),
	(3, 4, 'Mejorable', 1, 13),
	(4, 0, 'Muy mala ruta', 1, 13),
	(5, 0, 'Malisima', 1, 13);

-- Volcando estructura para tabla bbp.registereduser
CREATE TABLE IF NOT EXISTS `registereduser` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `registereduser_ibfk_1` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.registereduser: ~10 rows (aproximadamente)
DELETE FROM `registereduser`;
INSERT INTO `registereduser` (`id`, `name`, `last_name`, `age`, `location`, `profile_image`, `email`, `password`, `phone`, `username`) VALUES
	(1, 'Laura', 'Martínez', 28, 'Madrid', NULL, 'laura@gmail.com', 'pass123', '600123456', 'lauram'),
	(2, 'Carlos', 'Ruiz', 35, 'Barcelona', NULL, 'carlos@gmail.com', 'pass456', '611222333', 'carlosr'),
	(3, 'Ana', 'López', 42, 'Valencia', NULL, 'ana@gmail.com', 'pass789', '622333444', 'analopez'),
	(4, 'Juan', 'Armenteros', 12, 'Milano', '/uploads/profile.jpg', 'juanan302005@gmail.com', 'pass123', '123123', 'juanarmenteros'),
	(5, 'Carmen', 'Martínez', 12, 'Milano', '/uploads/profile.jpg', 'carmenmartinez@gmail.com', 'pass123', '12312313', 'carmen123'),
	(9, 'Juan', 'Armenteros', 230, 'Milano', '/uploads/9_profile.png', '12qwdsad@gmail.com', 'pass123', '123123', 'juan123'),
	(10, 'Carmen', 'Martinez', 12, 'Milano', '/uploads/10_profile.png', 'caskdfjhasdjfh@gmail.com', 'pass123', '1231231231', 'carmen123123'),
	(12, 'Carmen', 'Martinez', 12, 'Milano', '/uploads/12_profile.jpg', 'SAKFJHDSALKJFH@gmail.com', 'pass123', '123123', 'daddasd'),
	(13, 'sadasd', 'asdasd', 21, 'Sanlucar', '/uploads/13_profile.jpg', 'sadlkfjahdslfiha@gmail.com', 'pass123', '123123123', 'sdasdads'),
	(14, 'asdasd', 'asdads', 12, 'Milano', '/uploads/14_profile.jpg', 'alksfdjhadsfi@gmail.com', 'pass123', '649696908', 'asdads');

-- Volcando estructura para tabla bbp.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_type` enum('Registered','Guest') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.user: ~14 rows (aproximadamente)
DELETE FROM `user`;
INSERT INTO `user` (`id`, `user_type`) VALUES
	(1, 'Registered'),
	(2, 'Registered'),
	(3, 'Registered'),
	(4, 'Guest'),
	(5, 'Guest'),
	(6, 'Registered'),
	(7, 'Registered'),
	(8, 'Registered'),
	(9, 'Registered'),
	(10, 'Registered'),
	(11, 'Registered'),
	(12, 'Registered'),
	(13, 'Registered'),
	(14, 'Registered');

-- Volcando estructura para tabla bbp.userfriends
CREATE TABLE IF NOT EXISTS `userfriends` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `userfriends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registereduser` (`id`),
  CONSTRAINT `userfriends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `registereduser` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.userfriends: ~9 rows (aproximadamente)
DELETE FROM `userfriends`;
INSERT INTO `userfriends` (`user_id`, `friend_id`) VALUES
	(13, 1),
	(1, 2),
	(13, 2),
	(1, 3),
	(2, 3),
	(13, 3),
	(13, 5),
	(13, 10),
	(13, 14);

-- Volcando estructura para tabla bbp.userlikespath
CREATE TABLE IF NOT EXISTS `userlikespath` (
  `user_id` int(11) NOT NULL,
  `path_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`path_id`),
  KEY `path_id` (`path_id`),
  CONSTRAINT `userlikespath_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registereduser` (`id`),
  CONSTRAINT `userlikespath_ibfk_2` FOREIGN KEY (`path_id`) REFERENCES `path` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Volcando datos para la tabla bbp.userlikespath: ~11 rows (aproximadamente)
DELETE FROM `userlikespath`;
INSERT INTO `userlikespath` (`user_id`, `path_id`) VALUES
	(1, 1),
	(3, 1),
	(13, 1),
	(2, 2),
	(13, 2),
	(1, 3),
	(13, 4),
	(13, 5),
	(13, 6),
	(13, 7),
	(13, 12);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
