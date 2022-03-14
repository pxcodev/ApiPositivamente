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
) ENGINE = InnoDB AUTO_INCREMENT = 30 DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB AUTO_INCREMENT = 11 DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB AUTO_INCREMENT = 24 DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB AUTO_INCREMENT = 57 DEFAULT CHARSET = utf8mb4;

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

INSERT INTO
  `inscripciones` (`correo`, `id_jornada`, `asistencia`, `inscripcion`)
VALUES
  ('isis@gmail.com', 29, 1, 'Inscrito');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: jornadas
# ------------------------------------------------------------

INSERT INTO
  `jornadas` (
    `id`,
    `id_p`,
    `titulo`,
    `descripcion`,
    `extracto`,
    `fecha`,
    `hora`,
    `cupos`,
    `cuposrest`,
    `ubicacion`,
    `estado`,
    `inscripcion`,
    `imagenes`
  )
VALUES
  (
    29,
    23,
    'El Fondo de Innovación Humanitaria',
    '1. Humanitario: El proyecto tiene como objetivo la mejora de la práctica humanitaria, específicamente durante y después de las emergencias.\n2. Innovador: El objetivo del proyecto es innovador, pues crea e implementa una nueva tecnología o producto o mejora los existentes. Contribuye a mejorar la relevancia, pertinencia, cobertura o eficacia de la ayuda humanitaria.',
    '1. Humanitario: El proyecto tiene como objetivo la mejora de la práctica humanitaria, específicament',
    '2020-07-06',
    '01:06',
    10,
    9,
    'Pampatar',
    'Finalizada',
    'No Inscrito',
    'http://localhost:3000//subidas/jornadas/El_Fondo_de_Innovación_Humanitaria1594130017164/archivos0-1594130017191.jpg,http://localhost:3000//subidas/jornadas/El_Fondo_de_Innovación_Humanitaria1594130017164/archivos1-1594130017194.jpg,http://localhost:3000//subidas/jornadas/El_Fondo_de_Innovación_Humanitaria1594130017164/archivos2-1594130017204.jpg'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: mensajes_contact
# ------------------------------------------------------------

INSERT INTO
  `mensajes_contact` (
    `correo`,
    `nombre`,
    `apellido`,
    `mensaje`,
    `estado`,
    `fecha`,
    `id`
  )
VALUES
  (
    'el9imar@gmail.com',
    'Elimar',
    'Marcano',
    'Este es unn mensaje de prueba positivamente',
    'no leido',
    '2020-07-07',
    6
  );

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

INSERT INTO
  `noticias` (
    `id`,
    `titulo`,
    `contenido`,
    `extracto`,
    `autor`,
    `img_secundarias`,
    `img_principal`,
    `fecha`,
    `hora`,
    `estado`,
    `status`,
    `img_autor`
  )
VALUES
  (
    10,
    'La ONU propone la creación de un “bono contra el hambre” en América Latina.',
    '<div>Un nuevo informe de dos agencias de las Naciones Unidas propone un “bono contra el Hambre” además de un ingreso mínimo de emergencia para evitar que la crisis sanitari del COVID-19 se convierta en una crisis alimentaria que haga retroceder&nbsp;</div><div>a la región 20 años de desarrollo y empuje a millones más al hambre y la pobreza.&nbsp;</div>',
    'Un nuevo informe de dos agencias de las Naciones Unidas propone un “bono contra el Hambre” además de',
    'Victor Romero',
    '',
    'http://localhost:3000//subidas/noticias/1594129502079-La_ONU_propone_la_creación_de_un_“bono_contra_el_hambre”_en_América_Latina./archivo0-1594129502106.jpg',
    '2020-07-07',
    '9:45',
    0,
    'No publicado',
    ''
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: proyectos
# ------------------------------------------------------------

INSERT INTO
  `proyectos` (
    `id_p`,
    `titulo_p`,
    `descripcion_p`,
    `extracto`,
    `img_principal`,
    `fecha`,
    `hora`,
    `estado`
  )
VALUES
  (
    23,
    'El Fondo de Innovación Humanitaria2',
    '<div>El Fondo de Innovación Humanitaria (HIF) es una entidad que apoya la innovación en materia de ayuda humanitaria,&nbsp;</div><div>entendiéndola como el proceso con el que se crean, prueban y amplían enfoques de atención humanitaria en comunidades en crisis.2</div>',
    'El Fondo de Innovación Humanitaria (HIF) es una entidad que apoya la innovación en materia de ayuda ',
    'http://localhost:3000//subidas/proyectos/1594129569372-El_Fondo_de_Innovación_Humanitaria/archivo1-1594129582626.jpg',
    '2020-07-07',
    '9:46',
    ''
  );

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
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    53,
    'isis@gmail.com',
    3,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJpc2lzQGdtYWlsLmNvbSIsImluaSI6MTU5NDEyODk1MywiZXhwIjoxNTk0MTI5ODUzfQ.Z97O3YXOacwKQuUAb4ogxFfVA0oN7yoxCSfgV9tXTGI',
    'Cancelada',
    8388607
  );
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    54,
    'isis@gmail.com',
    3,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJpc2lzQGdtYWlsLmNvbSIsImluaSI6MTU5NDEyOTAyNCwiZXhwIjoxNTk0MTI5OTI0fQ.u1H9S9B91MCN3qRGXchnjK9J39bhsPXDrWj7ivUxDQc',
    'Completada',
    8388607
  );
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    55,
    'victor@gmail.com',
    3,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJ2aWN0b3JAZ21haWwuY29tIiwiaW5pIjoxNTk0MTI5MTI2LCJleHAiOjE1OTQxMjkxMjd9.wGOSTZF_pgxoJSkxO9WJYo8eX2NAa7s3XX0ZWFSgOmI',
    'Por Completar',
    8388607
  );
INSERT INTO
  `solicitudes` (`id`, `correo`, `nivel`, `token`, `estado`, `momento`)
VALUES
  (
    56,
    'manuelr@gmail.com',
    2,
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb3IiOiJtYW51ZWxyQGdtYWlsLmNvbSIsImluaSI6MTU5NDEzMDI0MywiZXhwIjoxNTk0MTMwMjQ0fQ.YMC352R7POgwoRqBEg8M3ElhsB4HLu9g1tuuK0nc48s',
    'Por Completar',
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
    '$2a$10$NgSmf.4qa6KNUnKonc67AeXgpe1rXNMFmvrQgatMJLxsLayCgOJjO',
    1,
    '2020-07-07 09:58:43',
    '2020-07-07 09:58:19'
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
    'isis@gmail.com',
    '$2a$10$cGfpdukfLmLoD3XCLgigMOsOQXJCviN7zZeoqvs1R67BsPJnk.uHe',
    3,
    '2020-07-07 09:58:30',
    '2020-07-07 09:40:20'
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
    'isis@gmail.com',
    'Isis',
    'Marcano',
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
    '2020-07-07 09:40:08',
    'Habilitado'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
