-- postgresql
/*
docker rm -f invhome-dbl && \
docker run --name invhome-dbl -d \
    -e POSTGRES_DB=invhome \
    -e POSTGRES_USER=invhome \
    -e POSTGRES_PASSWORD=invhome \
    -e TZ=America/Mexico_City \
    -p 5442:5432 \
    postgres

docker exec -it invhome-dbl psql -U invhome -d invhome

export DB_HOST="localhost"
export DB_USER="invhome"
export DB_PASSWORD="invhome"
export DB_NAME="invhome"
export DB_PORT="5442"
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== USUARIOS / SESIONES =====================
CREATE TABLE usuarios (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    nombre VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    foto_url VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessiones (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    usuario_id VARCHAR(36) REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(50) NOT NULL,
    user_agent VARCHAR(255),
    ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessiones_token ON sessiones(token);
CREATE INDEX idx_sessiones_usuario ON sessiones(usuario_id);


-- ===================== GRUPOS =====================
CREATE TABLE grupos (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20),
    icono VARCHAR(20),
    creado_por VARCHAR(36) REFERENCES usuarios(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios_grupos (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    usuario_id VARCHAR(36) REFERENCES usuarios(id) ON DELETE CASCADE,
    grupo_id VARCHAR(36) REFERENCES grupos(id) ON DELETE CASCADE,
    rol VARCHAR(20) DEFAULT 'member', -- 'admin' | 'member' | 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, grupo_id)
);
CREATE INDEX idx_usuarios_grupos_usuario ON usuarios_grupos(usuario_id);
CREATE INDEX idx_usuarios_grupos_grupo ON usuarios_grupos(grupo_id);


-- ===================== CATALOGO =====================
CREATE TABLE categorias (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    grupo_id VARCHAR(36) REFERENCES grupos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    icono VARCHAR(20),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, nombre)
);
CREATE INDEX idx_categorias_grupo ON categorias(grupo_id);

CREATE TABLE articulos (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    grupo_id VARCHAR(36) REFERENCES grupos(id) ON DELETE CASCADE,
    categoria_id VARCHAR(36) REFERENCES categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    nombre_normalizado VARCHAR(150),
    descripcion TEXT,
    cantidad NUMERIC(12,3) DEFAULT 0,
    optimo NUMERIC(12,3) DEFAULT 0,
    minimo NUMERIC(12,3) DEFAULT 0,
    unidad VARCHAR(20) DEFAULT 'pz',
    sku VARCHAR(80),
    foto_url VARCHAR(255),
    notas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_articulos_grupo ON articulos(grupo_id);
CREATE INDEX idx_articulos_categoria ON articulos(categoria_id);
CREATE INDEX idx_articulos_nombre_norm ON articulos(grupo_id, nombre_normalizado);


-- ===================== MOVIMIENTOS =====================
CREATE TABLE movimientos (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    articulo_id VARCHAR(36) REFERENCES articulos(id) ON DELETE CASCADE,
    grupo_id VARCHAR(36) REFERENCES grupos(id) ON DELETE CASCADE,
    usuario_id VARCHAR(36) REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL, -- 'agregar' | 'descontar' | 'reajustar'
    cantidad NUMERIC(12,3) NOT NULL,
    cantidad_anterior NUMERIC(12,3),
    cantidad_posterior NUMERIC(12,3),
    origen VARCHAR(30) DEFAULT 'manual', -- 'manual' | 'foto_kimi' | 'import'
    captura_id VARCHAR(36),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_movimientos_articulo ON movimientos(articulo_id);
CREATE INDEX idx_movimientos_grupo_fecha ON movimientos(grupo_id, created_at DESC);


-- ===================== VISION KIMI =====================
CREATE TABLE vision_capturas (
    id VARCHAR(36) DEFAULT uuid_generate_v4() UNIQUE NOT NULL PRIMARY KEY,
    usuario_id VARCHAR(36) REFERENCES usuarios(id) ON DELETE SET NULL,
    grupo_id VARCHAR(36) REFERENCES grupos(id) ON DELETE CASCADE,
    foto_path VARCHAR(255),
    items_detectados JSONB,
    items_finales JSONB,
    modo_aplicacion VARCHAR(20), -- 'reemplazar' | 'agregar' | NULL
    aplicada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    aplicada_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_vision_capturas_grupo ON vision_capturas(grupo_id);
CREATE INDEX idx_vision_capturas_usuario ON vision_capturas(usuario_id);


-- ===================== TRIGGERS =====================
CREATE OR REPLACE FUNCTION articulos_set_normalizado()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nombre_normalizado = lower(trim(NEW.nombre));
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articulos_norm
BEFORE INSERT OR UPDATE ON articulos
FOR EACH ROW EXECUTE FUNCTION articulos_set_normalizado();

CREATE OR REPLACE FUNCTION grupos_touch_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_grupos_touch
BEFORE UPDATE ON grupos
FOR EACH ROW EXECUTE FUNCTION grupos_touch_updated();


-- ===================== SEED =====================
-- admin / admin (cambiar tras primer login)
INSERT INTO usuarios (username, passwd, nombre, email, is_admin)
VALUES (
    'admin',
    '$argon2id$v=19$m=65536,t=3,p=4$8r63FgLgfI/xvjdmDKF0rg$Z2qMlvUv0QukeCVP16zMTRzcT4X2f6NZs2NQ6AYxkFk',
    'Administrador',
    'admin@invhome.local',
    TRUE
);
-- Hash corresponde a la contrasena 'test'. Cambiala en produccion.


-- ------ cambios de imagenes en categorias + ajustes globales -----
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255);

CREATE TABLE IF NOT EXISTS app_settings (
    clave VARCHAR(80) PRIMARY KEY,
    valor TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION app_settings_touch()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_settings_touch ON app_settings;
CREATE TRIGGER trg_app_settings_touch
BEFORE UPDATE ON app_settings
FOR EACH ROW EXECUTE FUNCTION app_settings_touch();


-- ------ cambios de vision async (Cloudflare 524 fix) -----
-- Vision se procesa en background; el endpoint responde de inmediato con captura_id
-- y el front hace polling. Los estados validos son 'processing' | 'done' | 'error'.
-- progreso JSONB: {stage: 'subiendo'|'llm'|'crops'|'done', current?, total?, message?}
ALTER TABLE vision_capturas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'done';
ALTER TABLE vision_capturas ADD COLUMN IF NOT EXISTS error_msg TEXT;
ALTER TABLE vision_capturas ADD COLUMN IF NOT EXISTS progreso JSONB;
CREATE INDEX IF NOT EXISTS idx_vision_capturas_estado ON vision_capturas(estado);
