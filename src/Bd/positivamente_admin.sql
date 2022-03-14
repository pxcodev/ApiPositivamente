-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-08-2020 a las 05:10:03
-- Versión del servidor: 10.4.13-MariaDB
-- Versión de PHP: 7.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `positivamente_admin`
--
CREATE DATABASE IF NOT EXISTS `positivamente_admin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `positivamente_admin`;

DELIMITER $$
--
-- Procedimientos
--
DROP PROCEDURE IF EXISTS `AddVoluntariosOGestores`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `AddVoluntariosOGestores` (IN `_correo` VARCHAR(50), IN `_nombres` VARCHAR(20), IN `_apellidos` VARCHAR(20), IN `_Realtoken` LONGTEXT, IN `_nivel` INT, IN `_fechareg` DATETIME, IN `_estado` VARCHAR(50))  BEGIN
	IF _nivel = 3 THEN
    	INSERT INTO voluntarios (correo, nombres, apellidos, fechareg, estado)
        VALUES (_correo, _nombres, _apellidos, _fechareg, _estado);
    ELSE
    	INSERT INTO gestores (correo, nombres, apellidos, fechareg, status)
        VALUES (_correo, _nombres, _apellidos, _fechareg, 'Habilitado');
    END IF;
    UPDATE solicitudes SET estado = "Completada" WHERE token = _Realtoken;
    UPDATE solicitudes SET estado = "Cancelada" WHERE correo = _correo AND token <> _Realtoken;
END$$

DROP PROCEDURE IF EXISTS `gestoresAddOrEdit`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `gestoresAddOrEdit` (IN `_id` INT(11), IN `_nombres` VARCHAR(50), IN `_apellidos` VARCHAR(100), IN `_cedula` VARCHAR(15), IN `_correo` VARCHAR(100), IN `_correoold` VARCHAR(100), IN `_status` VARCHAR(50), IN `_nivel_id` VARCHAR(50), IN `_pass` VARCHAR(100), IN `_token` MEDIUMTEXT, IN `_estado` VARCHAR(50))  BEGIN
	IF _id = 0 THEN
    	INSERT INTO solicitudes (correo, nivel, estado, token)
        VALUES (_correo, _nivel_id, _estado, _token);
        SET _id = LAST_INSERT_ID();
        INSERT INTO usuarios (correo, nivel, pass)
        VALUES (_correo, _nivel_id, _pass);
        INSERT INTO gestores (nombres, apellidos, cedula, correo, status)
        VALUES (_nombres, _apellidos, _cedula, _correo, _status);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE gestores
        SET 
        	nombres = _nombres,
        	apellidos = _apellidos,
        	cedula = _cedula,
            correo = _correo,
            status = _status
            WHERE correo = _correoold;
        UPDATE usuarios
        SET 
        	correo = _correo,
        	nivel = _nivel_id
            WHERE correo = _correoold;
        UPDATE solicitudes
        SET 
        	correo = _correo,
        	nivel = _nivel_id
            WHERE correo = _correoold;
    END IF;
    SELECT _id as id;
END$$

DROP PROCEDURE IF EXISTS `jornadasAddOrEdit`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `jornadasAddOrEdit` (IN `_id` INT(11), IN `_titulo` VARCHAR(100), IN `_descripcion` LONGTEXT, IN `_extracto` LONGTEXT, IN `_fecha` VARCHAR(50), IN `_hora` VARCHAR(50), IN `_ubicacion` LONGTEXT, IN `_cupos` INT(11), IN `_cuposrest` INT(11), IN `_id_p` INT(11), IN `_estado` VARCHAR(50), IN `_inscripcion` VARCHAR(50))  BEGIN
	IF _id = 0 THEN
    	INSERT INTO jornadas (titulo, descripcion, extracto, fecha, hora, ubicacion, cupos, cuposrest, id_p, estado, inscripcion)
        VALUES (_titulo, _descripcion, _extracto, _fecha, _hora, _ubicacion, _cupos, _cuposrest, _id_p, _estado, _inscripcion);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE jornadas
        SET 
        	titulo = _titulo,
        	descripcion = _descripcion,
            extracto = _extracto,
            fecha = _fecha,
            hora = _hora,
            ubicacion = _ubicacion,
            cupos = _cupos,
            cuposrest = _cuposrest,
		id_p = _id_p,
		estado = _estado
            WHERE id = _id;
    END IF;
    SELECT _id as id;
END$$

DROP PROCEDURE IF EXISTS `Login`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `Login` (IN `_correo` VARCHAR(50), IN `_nivel` INT, IN `_tiempo_entrada` DATETIME)  BEGIN
	IF _nivel = 3 THEN
    	SELECT * FROM usuarios INNER JOIN voluntarios ON usuarios.correo = voluntarios.correo WHERE usuarios.correo = _correo;
    ELSE
    	SELECT * FROM usuarios INNER JOIN gestores ON usuarios.correo = gestores.correo WHERE usuarios.correo = _correo;
    END IF;
    UPDATE usuarios SET tiempo_entrada = _tiempo_entrada WHERE usuarios.correo = _correo;
END$$

DROP PROCEDURE IF EXISTS `noticiasAddOrEdit`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `noticiasAddOrEdit` (IN `_id` INT(11), IN `_autor` VARCHAR(50), IN `_titulo` VARCHAR(100), IN `_contenido` LONGTEXT, IN `_extracto` LONGTEXT, IN `_fecha` VARCHAR(50), IN `_hora` VARCHAR(50), IN `_estado` TINYINT(1), IN `_status` VARCHAR(20), IN `_img_principal` MEDIUMTEXT, IN `_img_autor` VARCHAR(100))  BEGIN
	IF _id = 0 THEN
    	INSERT INTO noticias (autor, titulo, contenido, extracto, fecha, hora, estado, status, img_principal, img_autor)
        VALUES (_autor, _titulo, _contenido, _extracto, _fecha, _hora, _estado, _status, _img_principal, _img_autor);
        SET _id = LAST_INSERT_ID();
    ELSE
    	UPDATE noticias
        SET 
        	titulo = _titulo,
        	contenido = _contenido,
            extracto = _extracto,
            fecha = _fecha,
            hora = _hora,
            estado = _estado,
            status = _status,
            img_principal = _img_principal
            WHERE id = _id;
    END IF;
    SELECT _id as id;
END$$

DROP PROCEDURE IF EXISTS `proyectosAddOrEdit`$$
CREATE DEFINER=`positivamente`@`%` PROCEDURE `proyectosAddOrEdit` (IN `_id_p` INT(11), IN `_titulo_p` VARCHAR(100), IN `_descripcion_p` LONGTEXT, IN `_extracto` LONGTEXT, IN `_fecha` VARCHAR(50), IN `_hora` VARCHAR(50), IN `_img_principal` MEDIUMTEXT)  BEGIN
	IF _id_p = 0 THEN
    	INSERT INTO proyectos (titulo_p, descripcion_p, extracto, fecha, hora, img_principal)
        VALUES (_titulo_p, _descripcion_p, _extracto, _fecha, _hora, _img_principal);
        SET _id_p = LAST_INSERT_ID();
    ELSE
    	UPDATE proyectos
        SET 
        	titulo_p = _titulo_p,
        	descripcion_p = _descripcion_p,
            extracto = _extracto,
            img_principal = _img_principal
            WHERE id_p = _id_p;
    END IF;
    SELECT _id_p as id_p;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestores`
--

DROP TABLE IF EXISTS `gestores`;
CREATE TABLE `gestores` (
  `correo` varchar(50) NOT NULL,
  `nombres` varchar(20) NOT NULL,
  `apellidos` varchar(20) NOT NULL,
  `cedula` varchar(15) NOT NULL,
  `edad` int(11) NOT NULL,
  `tel_movil` varchar(50) NOT NULL,
  `tel_casa` varchar(50) NOT NULL,
  `tel_emergencia` varchar(50) NOT NULL,
  `foto` varchar(200) NOT NULL,
  `ocupacion` varchar(20) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL,
  `fechareg` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `gestores`
--

INSERT INTO `gestores` (`correo`, `nombres`, `apellidos`, `cedula`, `edad`, `tel_movil`, `tel_casa`, `tel_emergencia`, `foto`, `ocupacion`, `direccion`, `status`, `fechareg`) VALUES
('admin@admin.com', 'Victor', 'Romero', '26087861', 25, '', '', '', '', '', '', 'Habilitado', '0000-00-00 00:00:00'),
('gestor@gestor.com', 'Gestor', 'Positivamente', '12345678', 25, '04263378803', '0426558874', '028952531622', 'http://localhost:3000//subidas/perfiles/1594130609317-GestorPositivamente/archivo0-1594130609334.jpg', 'ninguna', 'juan griego', 'Habilitado', '2020-06-30 10:03:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hist_alergias`
--

DROP TABLE IF EXISTS `hist_alergias`;
CREATE TABLE `hist_alergias` (
  `correo` varchar(50) NOT NULL,
  `alergia` varchar(50) NOT NULL,
  `medicamento` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `hist_alergias`
--

INSERT INTO `hist_alergias` (`correo`, `alergia`, `medicamento`) VALUES
('voluntario@voluntario.com', 'alergia', 'nose');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hist_enfermedades`
--

DROP TABLE IF EXISTS `hist_enfermedades`;
CREATE TABLE `hist_enfermedades` (
  `correo` varchar(50) NOT NULL,
  `enfermedad` varchar(50) NOT NULL,
  `medicamento` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `hist_enfermedades`
--

INSERT INTO `hist_enfermedades` (`correo`, `enfermedad`, `medicamento`) VALUES
('voluntario@voluntario.com', 'diabetes', 'insulina');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
CREATE TABLE `inscripciones` (
  `correo` varchar(30) NOT NULL,
  `id_jornada` int(11) NOT NULL,
  `asistencia` int(11) NOT NULL,
  `inscripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jornadas`
--

DROP TABLE IF EXISTS `jornadas`;
CREATE TABLE `jornadas` (
  `id` int(11) NOT NULL,
  `id_p` int(11) NOT NULL COMMENT 'id del proyecto',
  `titulo` varchar(100) NOT NULL,
  `descripcion` longtext NOT NULL,
  `extracto` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(50) NOT NULL,
  `cupos` int(11) NOT NULL,
  `cuposrest` int(11) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `inscripcion` varchar(50) NOT NULL,
  `imagenes` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contact`
--

DROP TABLE IF EXISTS `mensajes_contact`;
CREATE TABLE `mensajes_contact` (
  `correo` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `mensaje` longtext NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `niveles`
--

DROP TABLE IF EXISTS `niveles`;
CREATE TABLE `niveles` (
  `nivel` varchar(20) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `niveles`
--

INSERT INTO `niveles` (`nivel`, `id`) VALUES
('administrador', 1),
('gestor', 2),
('voluntario', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticias`
--

DROP TABLE IF EXISTS `noticias`;
CREATE TABLE `noticias` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `contenido` longtext NOT NULL,
  `extracto` longtext NOT NULL,
  `autor` varchar(50) NOT NULL,
  `img_secundarias` varchar(50) NOT NULL,
  `img_principal` mediumtext NOT NULL,
  `fecha` varchar(50) NOT NULL,
  `hora` varchar(50) NOT NULL,
  `estado` tinyint(1) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `img_autor` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
CREATE TABLE `proyectos` (
  `id_p` int(11) NOT NULL,
  `titulo_p` varchar(100) NOT NULL,
  `descripcion_p` longtext NOT NULL,
  `extracto` longtext NOT NULL,
  `img_principal` mediumtext NOT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(50) NOT NULL,
  `estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
CREATE TABLE `solicitudes` (
  `id` int(11) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `nivel` int(11) NOT NULL,
  `token` mediumtext NOT NULL,
  `estado` varchar(50) NOT NULL,
  `momento` mediumint(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`) VALUES
(3, 'admin@admin.com', 1, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJhZG1pbkBhZG1pbi5jb20iLCJpbmkiOjE1ODM5NTM4MDEsImV4cCI6MTU4Mzk1NDcwMX0.UnihWr1So-rcvm5Zp8iX3k1i3DJMou20JY4qRVhTFM0', 'Completada', 8388607),
(50, 'gestor@gestor.com', 2, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJnZXN0b3JAZ2VzdG9yLmNvbSIsImluaSI6MTU5MzUyNTcxNywiZXhwIjoxNTkzNTI2NjE3fQ.GpHViC22EOgUWDfaBgh_kSpAcyRDr0XbL3aJeA23Ceg', 'Completada', 8388607),
(51, 'voluntario@voluntario.com', 3, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJ2b2x1bnRhcmlvQHZvbHVudGFyaW8uY29tIiwiaW5pIjoxNTkzNTI3OTA2LCJleHAiOjE1OTM1Mjg4MDZ9.T11STuTPdueBbACQUNZwkQDDAXbdKja_Z0ZUslbvPgQ', 'Completada', 8388607);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `correo` varchar(100) NOT NULL,
  `pass` varchar(100) NOT NULL,
  `nivel` int(11) NOT NULL,
  `tiempo_entrada` datetime NOT NULL,
  `tiempo_salida` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`correo`, `pass`, `nivel`, `tiempo_entrada`, `tiempo_salida`) VALUES
('admin@admin.com', '$2a$10$T3qt3.WL4MhzMMnrA/d.cuQBP2QuuQ1UanlZbXVLvrsecoEwCChkG', 1, '2020-07-07 10:13:50', '2020-07-07 10:04:35'),
('gestor@gestor.com', '$2a$10$6cUEBZUt6UR6oIS57xqiA.CE.r3siiS0gP3yJ7SCTVLZ6CTz4Pidu', 2, '2020-07-07 10:03:29', '2020-07-07 10:03:35'),
('voluntario@voluntario.com', '$2a$10$6cUEBZUt6UR6oIS57xqiA.CE.r3siiS0gP3yJ7SCTVLZ6CTz4Pidu', 3, '2020-07-07 10:05:55', '2020-07-07 10:06:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `voluntarios`
--

DROP TABLE IF EXISTS `voluntarios`;
CREATE TABLE `voluntarios` (
  `correo` varchar(50) NOT NULL,
  `nombres` varchar(20) NOT NULL,
  `apellidos` varchar(20) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `edad` int(11) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `ocupacion` varchar(100) NOT NULL,
  `tel_casa` varchar(50) NOT NULL,
  `tel_movil` varchar(50) NOT NULL,
  `tel_emergencia` varchar(50) NOT NULL,
  `habilidades` varchar(100) NOT NULL,
  `disponibilidad` varchar(100) NOT NULL,
  `foto` varchar(200) NOT NULL,
  `idiomas` varchar(100) NOT NULL,
  `fechareg` datetime NOT NULL,
  `estado` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `voluntarios`
--

INSERT INTO `voluntarios` (`correo`, `nombres`, `apellidos`, `cedula`, `edad`, `direccion`, `ocupacion`, `tel_casa`, `tel_movil`, `tel_emergencia`, `habilidades`, `disponibilidad`, `foto`, `idiomas`, `fechareg`, `estado`) VALUES
('voluntario@voluntario.com', 'Voluntario', 'Positivamente', '', 0, '', '', '', '', '', 'Cantar,Correr,Hablar', 'Lunes,Martes,Miercoles', 'http://localhost:3000//subidas/perfiles/1594130755667-VoluntarioPositivamente/archivo0-1594130755687.png', 'Español,Ingles,Portugues', '2020-06-30 10:40:23', 'Habilitado');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `jornadas`
--
ALTER TABLE `jornadas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `mensajes_contact`
--
ALTER TABLE `mensajes_contact`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `niveles`
--
ALTER TABLE `niveles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `noticias`
--
ALTER TABLE `noticias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id_p`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `jornadas`
--
ALTER TABLE `jornadas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `mensajes_contact`
--
ALTER TABLE `mensajes_contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `noticias`
--
ALTER TABLE `noticias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id_p` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
