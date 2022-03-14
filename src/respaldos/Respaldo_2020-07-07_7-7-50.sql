/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: gestores
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gestores` (
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hist_alergias
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hist_alergias` (
  `correo` varchar(50) NOT NULL,
  `alergia` varchar(50) NOT NULL,
  `medicamento` varchar(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hist_enfermedades
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hist_enfermedades` (
  `correo` varchar(50) NOT NULL,
  `enfermedad` varchar(50) NOT NULL,
  `medicamento` varchar(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: inscripciones
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inscripciones` (
  `correo` varchar(30) NOT NULL,
  `id_jornada` int(11) NOT NULL,
  `asistencia` int(11) NOT NULL,
  `inscripcion` varchar(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: jornadas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `jornadas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `imagenes` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 29 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: mensajes_contact
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mensajes_contact` (
  `correo` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `mensaje` longtext NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: niveles
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `niveles` (
  `nivel` varchar(20) NOT NULL,
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: noticias
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `noticias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `img_autor` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: proyectos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `proyectos` (
  `id_p` int(11) NOT NULL AUTO_INCREMENT,
  `titulo_p` varchar(100) NOT NULL,
  `descripcion_p` longtext NOT NULL,
  `extracto` longtext NOT NULL,
  `img_principal` mediumtext NOT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(50) NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_p`)
) ENGINE = InnoDB AUTO_INCREMENT = 23 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: solicitudes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(100) NOT NULL,
  `nivel` int(11) NOT NULL,
  `token` mediumtext NOT NULL,
  `estado` varchar(50) NOT NULL,
  `momento` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 53 DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `correo` varchar(100) NOT NULL,
  `pass` varchar(100) NOT NULL,
  `nivel` int(11) NOT NULL,
  `tiempo_entrada` datetime NOT NULL,
  `tiempo_salida` datetime NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: voluntarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `voluntarios` (
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: gestores
# ------------------------------------------------------------

INSERT INTO
  `gestores` (
    `correo`,
    `nombres`,
    `apellidos`,
    `cedula`,
    `edad`,
    `tel_movil`,
    `tel_casa`,
    `tel_emergencia`,
    `foto`,
    `ocupacion`,
    `direccion`,
    `status`,
    `fechareg`
  )
VALUES
  (
    'admin@admin.com',
    'Victor',
    'Romero',
    '26087861',
    25,
    '',
    '',
    '',
    '',
    '',
    '',
    'Habilitado',
    '0000-00-00 00:00:00'
  );
INSERT INTO
  `gestores` (
    `correo`,
    `nombres`,
    `apellidos`,
    `cedula`,
    `edad`,
    `tel_movil`,
    `tel_casa`,
    `tel_emergencia`,
    `foto`,
    `ocupacion`,
    `direccion`,
    `status`,
    `fechareg`
  )
VALUES
  (
    'gestor@gestor.com',
    'Gestor',
    'Positivamente',
    '12345678',
    0,
    '',
    '',
    '',
    '',
    '',
    '',
    'Deshabilitado',
    '2020-06-30 10:03:41'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hist_alergias
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hist_enfermedades
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: inscripciones
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: jornadas
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: mensajes_contact
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: niveles
# ------------------------------------------------------------

INSERT INTO
  `niveles` (`nivel`, `id`)
VALUES
  ('administrador', 1);
INSERT INTO
  `niveles` (`nivel`, `id`)
VALUES
  ('gestor', 2);
INSERT INTO
  `niveles` (`nivel`, `id`)
VALUES
  ('voluntario', 3);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: noticias
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: proyectos
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: solicitudes
# ------------------------------------------------------------

INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    3,
    'admin@admin.com',
    1,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJhZG1pbkBhZG1pbi5jb20iLCJpbmkiOjE1ODM5NTM4MDEsImV4cCI6MTU4Mzk1NDcwMX0.UnihWr1So-rcvm5Zp8iX3k1i3DJMou20JY4qRVhTFM0',
    'Completada',
    8388607
  );
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    50,
    'gestor@gestor.com',
    2,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJnZXN0b3JAZ2VzdG9yLmNvbSIsImluaSI6MTU5MzUyNTcxNywiZXhwIjoxNTkzNTI2NjE3fQ.GpHViC22EOgUWDfaBgh_kSpAcyRDr0XbL3aJeA23Ceg',
    'Completada',
    8388607
  );
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    51,
    'voluntario@voluntario.com',
    3,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJ2b2x1bnRhcmlvQHZvbHVudGFyaW8uY29tIiwiaW5pIjoxNTkzNTI3OTA2LCJleHAiOjE1OTM1Mjg4MDZ9.T11STuTPdueBbACQUNZwkQDDAXbdKja_Z0ZUslbvPgQ',
    'Completada',
    8388607
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

INSERT INTO
  `usuarios` (
    `correo`,
    `pass`,
    `nivel`,
    `tiempo_entrada`,
    `tiempo_salida`
  )
VALUES
  (
    'admin@admin.com',
    '$2a$10$T3qt3.WL4MhzMMnrA/d.cuQBP2QuuQ1UanlZbXVLvrsecoEwCChkG',
    1,
    '2020-07-07 05:51:57',
    '2020-07-07 05:45:57'
  );
INSERT INTO
  `usuarios` (
    `correo`,
    `pass`,
    `nivel`,
    `tiempo_entrada`,
    `tiempo_salida`
  )
VALUES
  (
    'gestor@gestor.com',
    '$2a$10$6cUEBZUt6UR6oIS57xqiA.CE.r3siiS0gP3yJ7SCTVLZ6CTz4Pidu',
    2,
    '2020-07-07 05:40:10',
    '2020-06-30 10:37:46'
  );
INSERT INTO
  `usuarios` (
    `correo`,
    `pass`,
    `nivel`,
    `tiempo_entrada`,
    `tiempo_salida`
  )
VALUES
  (
    'voluntario@voluntario.com',
    '$2a$10$6cUEBZUt6UR6oIS57xqiA.CE.r3siiS0gP3yJ7SCTVLZ6CTz4Pidu',
    3,
    '2020-07-07 05:40:29',
    '2020-06-30 11:20:54'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: voluntarios
# ------------------------------------------------------------

INSERT INTO
  `voluntarios` (
    `correo`,
    `nombres`,
    `apellidos`,
    `cedula`,
    `edad`,
    `direccion`,
    `ocupacion`,
    `tel_casa`,
    `tel_movil`,
    `tel_emergencia`,
    `habilidades`,
    `disponibilidad`,
    `foto`,
    `idiomas`,
    `fechareg`,
    `estado`
  )
VALUES
  (
    'voluntario@voluntario.com',
    'Voluntario',
    'Positivamente',
    '',
    0,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '2020-06-30 10:40:23',
    'Deshabilitado'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
