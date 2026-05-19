-- =============================================================
-- database.sql — Belleza & Estilo · Supabase (PostgreSQL)
-- =============================================================
-- Ejecución: Dashboard Supabase → SQL Editor → Run
-- Orden: extensions → tipos → tablas → RLS → funciones → datos
-- =============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONES
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda de texto difuso


-- ────────────────────────────────────────────────────────────
-- 1. TIPOS ENUM
-- ────────────────────────────────────────────────────────────
create type rol_usuario        as enum ('cliente', 'admin');
create type estado_reserva     as enum ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio');
create type tipo_cupon         as enum ('porcentaje', 'monto_fijo');
create type categoria_servicio as enum ('Cabello', 'Facial', 'Uñas', 'Depilación', 'Maquillaje', 'Bienestar');


-- ────────────────────────────────────────────────────────────
-- 2. PERFILES DE USUARIO
--    Extiende auth.users de Supabase Auth.
--    Se crea automáticamente al registrarse (trigger).
-- ────────────────────────────────────────────────────────────
create table public.perfiles (
  id             uuid        primary key references auth.users(id) on delete cascade,
  email          text        not null,
  nombre         text        not null check (char_length(nombre) between 2 and 120),
  -- NOTA: apellido sin mínimo para que el trigger pueda insertar '-' como fallback
  apellido       text        not null check (char_length(apellido) <= 120),
  telefono       text        check (telefono ~ '^\+?56\s?9\s?\d{4}\s?\d{4}$'),
  rol            rol_usuario not null default 'cliente',
  activo         boolean     not null default true,   -- false = baneado
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.perfiles is 'Perfil de cada usuario autenticado.';

-- Trigger: actualizar actualizado_en en cualquier UPDATE
create or replace function public.fn_set_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger trg_perfiles_actualizado_en
  before update on public.perfiles
  for each row execute function public.fn_set_actualizado_en();

-- Trigger: crear perfil automáticamente al registrar usuario en Supabase Auth
-- IMPORTANTE: usa coalesce + nullif para evitar insertar cadenas vacías
--             que fallarían el check de nombre (mínimo 2 caracteres).
create or replace function public.fn_crear_perfil_usuario()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfiles (id, email, nombre, apellido)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'),  ''), 'Usuario'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'apellido'), ''), '-')
  );
  return new;
end;
$$;

create trigger trg_crear_perfil
  after insert on auth.users
  for each row execute function public.fn_crear_perfil_usuario();


-- ────────────────────────────────────────────────────────────
-- 3. PROFESIONALES
-- ────────────────────────────────────────────────────────────
create table public.profesionales (
  id            serial      primary key,
  nombre        text        not null,
  iniciales     text        not null check (char_length(iniciales) between 1 and 3),
  especialidad  text        not null,
  activo        boolean     not null default true,
  creado_en     timestamptz not null default now()
);

comment on table public.profesionales is 'Estilistas y profesionales del salón.';

insert into public.profesionales (nombre, iniciales, especialidad) values
  ('Catalina Rojas',   'CR', 'Cabello y coloración'),
  ('Florencia Muñoz',  'FM', 'Uñas y maquillaje'),
  ('Macarena Toledo',  'MT', 'Facial y bienestar');


-- ────────────────────────────────────────────────────────────
-- 4. SERVICIOS
-- ────────────────────────────────────────────────────────────
create table public.servicios (
  id             serial               primary key,
  nombre         text                 not null,
  categoria      categoria_servicio   not null,
  descripcion    text                 not null,
  precio         integer              not null check (precio > 0),
  unidad         text                 not null default 'servicio',
  duracion_min   integer              not null check (duracion_min > 0),
  destacado        boolean              not null default false,
  activo           boolean              not null default true,
  imagen_path      text,
  imagen_posicion  text                 not null default 'center',
  creado_en        timestamptz          not null default now(),
  actualizado_en   timestamptz          not null default now()
);

create trigger trg_servicios_actualizado_en
  before update on public.servicios
  for each row execute function public.fn_set_actualizado_en();

-- Catálogo (precios mid-tier Osorno 2026)
-- IDs explícitos para que coincidan con data.js del frontend
insert into public.servicios (id, nombre, categoria, descripcion, precio, unidad, duracion_min, destacado, imagen_path) values
  (1,  'Corte de Cabello Dama',           'Cabello',    'Corte personalizado según tu estilo y tipo de rostro. Incluye lavado, secado y peinado final.',        20000, 'servicio', 40,  true,  'corte-cabello-dama.webp'),
  (2,  'Corte de Cabello Caballero',      'Cabello',    'Corte clásico o moderno con máquina y tijera. Incluye perfilado de barba y peinado.',                   12000, 'servicio', 30,  false, 'corte-cabello-caballero.webp'),
  (3,  'Tratamiento Facial',              'Facial',     'Limpieza profunda, exfoliación, mascarilla e hidratación. Devuelve luminosidad a tu piel.',             42000, 'sesión',   75,  true,  'tratamiento-facial.webp'),
  (4,  'Manicure Tradicional',            'Uñas',       'Cuidado completo de manos y uñas con esmaltado tradicional. Limado, cutícula e hidratación.',           15000, 'servicio', 45,  false, 'manicure-tradicional.webp'),
  (5,  'Manicure Permanente',             'Uñas',       'Esmalte semipermanente que dura hasta 3 semanas. Acabado brillante y resistente.',                      22000, 'servicio', 60,  true,  'manicure-permanente.webp'),
  (6,  'Pedicure',                        'Uñas',       'Tratamiento relajante para pies. Exfoliación, hidratación, limado y esmaltado tradicional.',            18000, 'servicio', 50,  false, 'pedicure.webp'),
  (7,  'Depilación Axilas',               'Depilación', 'Depilación con cera profesional tibia. Suavidad y cuidado en piel sensible.',                           8000,  'servicio', 15,  false, 'depilacion-axilas.webp'),
  (8,  'Depilación Medias Piernas',       'Depilación', 'Depilación con cera de rodilla hacia abajo. Resultado duradero y prolijo.',                             14000, 'servicio', 30,  false, 'depilacion-medias-piernas.webp'),
  (9,  'Depilación Piernas Completas',    'Depilación', 'Depilación con cera desde la ingle hasta el tobillo. Incluye empeines y dedos.',                       22000, 'servicio', 45,  false, 'depilacion-piernas-completas.webp'),
  (10, 'Depilación Bikini',               'Depilación', 'Depilación de zona bikini con cera profesional. Discreción y profesionalismo.',                         12000, 'servicio', 20,  false, 'depilacion-bikini.webp'),
  (11, 'Depilación Rostro (bozo / cejas)','Depilación', 'Diseño y depilación de cejas o bozo con cera o pinza, según tu preferencia.',                           7000,  'servicio', 15,  false, 'depilacion-rostro.webp'),
  (12, 'Maquillaje Profesional',          'Maquillaje', 'Maquillaje para eventos, fiestas o sesiones fotográficas. Larga duración con productos premium.',       55000, 'servicio', 60,  true,  'maquillaje-profesional.webp'),
  (13, 'Maquillaje de Novia',             'Maquillaje', 'Maquillaje a prueba de lágrimas con productos de alta gama. Incluye prueba previa.',                   110000,'servicio', 120, true,  'maquillaje-novia.webp'),
  (14, 'Masaje Relajante',                'Bienestar',  'Masaje corporal con aceites aromáticos para liberar tensión y reducir estrés.',                         35000, 'hora',     60,  true,  'masaje-relajante.webp'),
  (15, 'Masaje Descontracturante',        'Bienestar',  'Masaje terapéutico profundo para descontracturar zonas de tensión muscular crónica.',                   40000, 'hora',     60,  false, 'masaje-descontracturante.webp'),
  (16, 'Coloración / Tintura',            'Cabello',    'Tintura profesional con productos sin amoníaco. Incluye lavado y peinado final.',                       38000, 'servicio', 90,  false, 'coloracion-tintura.webp'),
  (17, 'Mechas / Balayage',               'Cabello',    'Técnica de iluminación con mechas o balayage. Resultado natural y luminoso.',                           75000, 'servicio', 180, false, 'balayage.webp'),
  (18, 'Alisado / Keratina',              'Cabello',    'Tratamiento de keratina que alisa, repara y aporta brillo. Dura hasta 3 meses.',                        65000, 'sesión',   150, false, 'alisado-keratina.webp'),
  (19, 'Peinado para Eventos',            'Cabello',    'Peinado de gala con recogido, ondas o trenzas. Para matrimonios, graduaciones y fiestas.',              28000, 'servicio', 60,  false, 'peinado-eventos.webp');

-- Resetear la secuencia para que el próximo INSERT auto-incremente desde 20
select setval('servicios_id_seq', (select max(id) from public.servicios));


-- ────────────────────────────────────────────────────────────
-- 5. HORARIOS (slots disponibles globales)
-- ────────────────────────────────────────────────────────────
create table public.slots_horario (
  id   serial primary key,
  hora time   not null unique
);

insert into public.slots_horario (hora) values
  ('09:00'), ('10:30'), ('12:00'), ('14:00'),
  ('15:30'), ('17:00'), ('18:30');


-- ────────────────────────────────────────────────────────────
-- 6. RESERVAS
-- ────────────────────────────────────────────────────────────
create table public.reservas (
  id                uuid           primary key default uuid_generate_v4(),
  codigo            text           not null unique,        -- ej: BE-ABCD12
  usuario_id        uuid           references public.perfiles(id) on delete set null,
  -- Snapshot de datos del cliente en el momento de la reserva
  -- Nullable porque se obtienen del perfil via usuario_id si no se envían
  cliente_nombre    text,
  cliente_correo    text,
  cliente_telefono  text,
  -- Asignación
  profesional_id    integer        references public.profesionales(id) on delete set null,
  fecha             date           not null,
  hora              time           not null,
  -- Totales
  total_precio      integer        not null check (total_precio >= 0),
  total_duracion    integer        not null check (total_duracion > 0),
  -- Estado
  estado            estado_reserva not null default 'pendiente',
  notas_cliente     text,
  notas_admin       text,
  -- Cupón
  cupon_codigo      text,
  descuento_monto   integer        not null default 0,
  -- Timestamps
  creado_en         timestamptz    not null default now(),
  actualizado_en    timestamptz    not null default now(),
  cancelado_en      timestamptz,
  motivo_cancelacion text
);

create index idx_reservas_usuario     on public.reservas(usuario_id);
create index idx_reservas_profesional on public.reservas(profesional_id);
create index idx_reservas_fecha       on public.reservas(fecha);
create index idx_reservas_estado      on public.reservas(estado);
create index idx_reservas_codigo      on public.reservas(codigo);

create trigger trg_reservas_actualizado_en
  before update on public.reservas
  for each row execute function public.fn_set_actualizado_en();

comment on table public.reservas is 'Citas reservadas por clientes.';


-- ────────────────────────────────────────────────────────────
-- 7. SERVICIOS DE CADA RESERVA (relación N:M)
-- ────────────────────────────────────────────────────────────
create table public.reserva_servicios (
  id            serial  primary key,
  reserva_id    uuid    not null references public.reservas(id) on delete cascade,
  servicio_id   integer not null references public.servicios(id) on delete restrict,
  -- Snapshot del precio y nombre al momento de la reserva
  nombre_snap   text    not null,
  precio_snap   integer not null,
  duracion_snap integer not null
);

create index idx_reserva_servicios_reserva on public.reserva_servicios(reserva_id);

comment on table public.reserva_servicios is 'Servicios incluidos en cada reserva (puede ser más de uno).';


-- ────────────────────────────────────────────────────────────
-- 8. CUPONES DE DESCUENTO
-- ────────────────────────────────────────────────────────────
create table public.cupones (
  id             serial      primary key,
  codigo         text        not null unique,
  tipo           tipo_cupon  not null,
  valor          integer     not null check (valor > 0),
  min_reserva    integer     not null default 0,
  max_usos       integer,                                -- null = ilimitado
  usos_actuales  integer     not null default 0,
  activo         boolean     not null default true,
  asignado_a     uuid        references public.perfiles(id) on delete set null, -- null = público
  valido_desde   timestamptz,
  valido_hasta   timestamptz,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index idx_cupones_codigo on public.cupones(codigo);

create trigger trg_cupones_actualizado_en
  before update on public.cupones
  for each row execute function public.fn_set_actualizado_en();

insert into public.cupones (codigo, tipo, valor, min_reserva, max_usos, activo) values
  ('BIENVENIDA10', 'porcentaje', 10, 15000, null, true);

comment on table public.cupones is 'Cupones de descuento para reservas.';


-- ────────────────────────────────────────────────────────────
-- 9. CONFIGURACIÓN GLOBAL DEL SALÓN
-- ────────────────────────────────────────────────────────────
create table public.configuracion (
  clave          text primary key,
  valor          jsonb not null,
  descripcion    text,
  actualizado_en timestamptz not null default now()
);

create trigger trg_configuracion_actualizado_en
  before update on public.configuracion
  for each row execute function public.fn_set_actualizado_en();

insert into public.configuracion (clave, valor, descripcion) values
  ('contacto',      '{"nombre":"Belleza & Estilo","direccion":"Av. Mackenna 850, Osorno","telefono":"+56 9 8765 4321","correo":"contacto.bellezayestilo@yahoo.com","whatsapp":"56987654321","horario":"Lun a Sáb: 09:00 - 20:00 hrs"}', 'Datos de contacto del salón'),
  ('redes_sociales','{"instagram":"https://instagram.com","facebook":"https://facebook.com","google_maps":"https://www.google.com/maps/search/?api=1&query=Av+Mackenna+850+Osorno+Chile"}', 'URLs de redes sociales'),
  ('reservas',      '{"cancelacion_min_horas":24,"slot_duracion_min":30,"dias_anticipacion_max":60,"confirmacion_automatica":false}', 'Parámetros del sistema de reservas');

comment on table public.configuracion is 'Configuración global editable desde el panel admin.';


-- ────────────────────────────────────────────────────────────
-- 10. LOGS DE ACTIVIDAD ADMIN
-- ────────────────────────────────────────────────────────────
create table public.logs_admin (
  id         bigserial   primary key,
  admin_id   uuid        references public.perfiles(id) on delete set null,
  accion     text        not null,
  entidad    text,
  entidad_id text,
  detalle    jsonb,
  creado_en  timestamptz not null default now()
);

create index idx_logs_admin_admin_id on public.logs_admin(admin_id);
create index idx_logs_admin_accion   on public.logs_admin(accion);

comment on table public.logs_admin is 'Auditoría de acciones realizadas por administradores.';


-- ────────────────────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────
alter table public.perfiles         enable row level security;
alter table public.profesionales     enable row level security;
alter table public.servicios         enable row level security;
alter table public.slots_horario     enable row level security;
alter table public.reservas          enable row level security;
alter table public.reserva_servicios enable row level security;
alter table public.cupones           enable row level security;
alter table public.configuracion     enable row level security;
alter table public.logs_admin        enable row level security;

-- Helper: saber si el usuario actual es admin
create or replace function public.fn_es_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ── PERFILES ──────────────────────────────────────────────
create policy "perfiles: leer propio"
  on public.perfiles for select
  using (id = auth.uid() or public.fn_es_admin());

create policy "perfiles: editar propio"
  on public.perfiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and rol = 'cliente'  -- no puede auto-promocionarse a admin
  );

create policy "perfiles: admin total"
  on public.perfiles for all
  using (public.fn_es_admin());

-- ── PROFESIONALES ─────────────────────────────────────────
create policy "profesionales: lectura pública"
  on public.profesionales for select using (true);

create policy "profesionales: admin escribe"
  on public.profesionales for all
  using (public.fn_es_admin());

-- ── SERVICIOS ─────────────────────────────────────────────
create policy "servicios: lectura pública"
  on public.servicios for select using (activo = true or public.fn_es_admin());

create policy "servicios: admin escribe"
  on public.servicios for all
  using (public.fn_es_admin());

-- ── SLOTS HORARIO ─────────────────────────────────────────
create policy "slots: lectura pública"
  on public.slots_horario for select using (true);

create policy "slots: admin escribe"
  on public.slots_horario for all
  using (public.fn_es_admin());

-- ── RESERVAS ──────────────────────────────────────────────
create policy "reservas: leer propio"
  on public.reservas for select
  using (usuario_id = auth.uid() or public.fn_es_admin());

create policy "reservas: crear"
  on public.reservas for insert
  with check (auth.uid() is not null);

create policy "reservas: cliente cancela"
  on public.reservas for update
  using (usuario_id = auth.uid())
  with check (
    usuario_id = auth.uid()
    and estado = 'cancelada'
  );

create policy "reservas: admin actualiza"
  on public.reservas for update
  using (public.fn_es_admin());

create policy "reservas: admin elimina"
  on public.reservas for delete
  using (public.fn_es_admin());

-- ── RESERVA_SERVICIOS ─────────────────────────────────────
create policy "reserva_servicios: leer"
  on public.reserva_servicios for select
  using (
    exists (
      select 1 from public.reservas r
      where r.id = reserva_id
        and (r.usuario_id = auth.uid() or public.fn_es_admin())
    )
  );

create policy "reserva_servicios: insertar"
  on public.reserva_servicios for insert
  with check (auth.uid() is not null);

create policy "reserva_servicios: admin elimina"
  on public.reserva_servicios for delete
  using (public.fn_es_admin());

-- ── CUPONES ───────────────────────────────────────────────
create policy "cupones: leer activos"
  on public.cupones for select
  using (
    public.fn_es_admin()
    or (
      activo = true
      and (asignado_a is null or asignado_a = auth.uid())
      and (valido_desde is null or valido_desde <= now())
      and (valido_hasta is null or valido_hasta >= now())
    )
  );

create policy "cupones: admin escribe"
  on public.cupones for all
  using (public.fn_es_admin());

-- ── CONFIGURACIÓN ─────────────────────────────────────────
create policy "configuracion: lectura pública"
  on public.configuracion for select using (true);

create policy "configuracion: admin escribe"
  on public.configuracion for all
  using (public.fn_es_admin());

-- ── LOGS ADMIN ────────────────────────────────────────────
create policy "logs: solo admin"
  on public.logs_admin for all
  using (public.fn_es_admin());


-- ────────────────────────────────────────────────────────────
-- 12. FUNCIONES DE NEGOCIO
-- ────────────────────────────────────────────────────────────

-- Verificar disponibilidad de un slot
create or replace function public.fn_slot_disponible(
  p_profesional_id integer,
  p_fecha          date,
  p_hora           time
)
returns boolean language sql stable security definer as $$
  select not exists (
    select 1 from public.reservas
    where profesional_id = p_profesional_id
      and fecha = p_fecha
      and hora  = p_hora
      and estado not in ('cancelada')
  );
$$;

-- Obtener slots ocupados de un profesional en una fecha
create or replace function public.fn_slots_ocupados(
  p_profesional_id integer,
  p_fecha          date
)
returns table(hora time) language sql stable security definer as $$
  select r.hora
  from public.reservas r
  where r.profesional_id = p_profesional_id
    and r.fecha = p_fecha
    and r.estado not in ('cancelada');
$$;

-- Validar cupón y calcular descuento
create or replace function public.fn_validar_cupon(
  p_codigo        text,
  p_total_precio  integer,
  p_usuario_id    uuid default null
)
returns jsonb language plpgsql security definer as $$
declare
  v_cupon     record;
  v_descuento integer := 0;
begin
  select * into v_cupon
  from public.cupones
  where codigo = upper(p_codigo)
    and activo = true
    and (asignado_a is null or asignado_a = p_usuario_id)
    and (valido_desde is null or valido_desde <= now())
    and (valido_hasta is null or valido_hasta >= now())
    and (max_usos is null or usos_actuales < max_usos)
    and p_total_precio >= min_reserva;

  if not found then
    return jsonb_build_object('valido', false, 'error', 'Cupón inválido o expirado', 'descuento', 0);
  end if;

  if v_cupon.tipo = 'porcentaje' then
    v_descuento := (p_total_precio * v_cupon.valor / 100);
  else
    v_descuento := least(v_cupon.valor, p_total_precio);
  end if;

  return jsonb_build_object(
    'valido',    true,
    'descuento', v_descuento,
    'tipo',      v_cupon.tipo,
    'valor',     v_cupon.valor,
    'cupon_id',  v_cupon.id
  );
end;
$$;

-- KPIs para el dashboard admin
create or replace function public.fn_dashboard_kpis()
returns jsonb language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  if not public.fn_es_admin() then
    raise exception 'No autorizado';
  end if;

  select jsonb_build_object(
    'total_clientes',      (select count(*) from public.perfiles where rol = 'cliente' and activo = true),
    'total_reservas',      (select count(*) from public.reservas),
    'reservas_pendientes', (select count(*) from public.reservas where estado = 'pendiente'),
    'reservas_hoy',        (select count(*) from public.reservas where fecha = current_date and estado not in ('cancelada')),
    'ingresos_mes',        (select coalesce(sum(total_precio - descuento_monto), 0)
                            from public.reservas
                            where estado = 'completada'
                              and date_trunc('month', fecha::timestamptz) = date_trunc('month', now())),
    'ingresos_total',      (select coalesce(sum(total_precio - descuento_monto), 0)
                            from public.reservas where estado = 'completada'),
    'servicio_top',        (select s.nombre
                            from public.reserva_servicios rs
                            join public.servicios s on s.id = rs.servicio_id
                            group by s.nombre
                            order by count(*) desc limit 1)
  ) into v_result;

  return v_result;
end;
$$;


-- ────────────────────────────────────────────────────────────
-- 13. VIEWS ÚTILES PARA ADMIN
-- ────────────────────────────────────────────────────────────

-- Reservas con info completa para el panel admin
create or replace view public.v_reservas_admin as
  select
    r.id,
    r.codigo,
    r.estado,
    r.fecha,
    r.hora,
    r.total_precio,
    r.descuento_monto,
    r.total_precio - r.descuento_monto  as total_final,
    r.total_duracion,
    r.cliente_nombre,
    r.cliente_correo,
    r.cliente_telefono,
    r.cupon_codigo,
    r.notas_cliente,
    r.notas_admin,
    r.motivo_cancelacion,
    r.creado_en,
    r.cancelado_en,
    p.nombre     as profesional_nombre,
    p.iniciales  as profesional_iniciales,
    u.email      as usuario_email,
    (
      select jsonb_agg(jsonb_build_object(
        'nombre',   rs.nombre_snap,
        'precio',   rs.precio_snap,
        'duracion', rs.duracion_snap
      ))
      from public.reserva_servicios rs
      where rs.reserva_id = r.id
    ) as servicios
  from public.reservas r
  left join public.profesionales p on p.id = r.profesional_id
  left join public.perfiles u on u.id = r.usuario_id;

-- Métricas por servicio
create or replace view public.v_metricas_servicios as
  select
    s.id,
    s.nombre,
    s.categoria,
    s.precio,
    s.activo,
    count(rs.id)                         as total_reservas,
    coalesce(sum(rs.precio_snap), 0)     as ingresos_generados
  from public.servicios s
  left join public.reserva_servicios rs on rs.servicio_id = s.id
  left join public.reservas r on r.id = rs.reserva_id and r.estado = 'completada'
  group by s.id, s.nombre, s.categoria, s.precio, s.activo
  order by total_reservas desc;

-- Clientes con conteo de reservas para el panel admin
create or replace view public.v_clientes_admin as
  select
    p.id,
    p.email,
    p.nombre,
    p.apellido,
    p.telefono,
    p.activo,
    p.creado_en,
    count(r.id)                                                          as total_reservas,
    coalesce(sum(r.total_precio - r.descuento_monto)
      filter (where r.estado = 'completada'), 0)                         as gasto_total,
    max(r.fecha)                                                         as ultima_reserva
  from public.perfiles p
  left join public.reservas r on r.usuario_id = p.id
  where p.rol = 'cliente'
  group by p.id, p.email, p.nombre, p.apellido, p.telefono, p.activo, p.creado_en;


-- ────────────────────────────────────────────────────────────
-- 14. STORAGE — BUCKET DE IMÁGENES
-- ────────────────────────────────────────────────────────────
-- Ejecutar desde SQL Editor (requiere permiso de superusuario Supabase).
-- El bucket "imagenes" es público: cualquiera puede leer las URLs,
-- pero solo admins pueden subir o eliminar archivos.

insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

-- Lectura pública de cualquier archivo del bucket
create policy "imagenes: lectura publica"
  on storage.objects for select
  using (bucket_id = 'imagenes');

-- Solo el admin autenticado puede subir archivos
create policy "imagenes: admin sube"
  on storage.objects for insert
  with check (
    bucket_id = 'imagenes'
    and public.fn_es_admin()
  );

-- Solo el admin puede actualizar metadatos
create policy "imagenes: admin actualiza"
  on storage.objects for update
  using (
    bucket_id = 'imagenes'
    and public.fn_es_admin()
  );

-- Solo el admin puede eliminar archivos
create policy "imagenes: admin elimina"
  on storage.objects for delete
  using (
    bucket_id = 'imagenes'
    and public.fn_es_admin()
  );


-- ════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ════════════════════════════════════════════════════════════
--
-- PRÓXIMOS PASOS TRAS EJECUTAR:
--
--   1. Ir a Authentication → Settings y verificar que esté
--      activo "Enable email confirmations".
--
--   2. Para crear el primer usuario ADMIN:
--        a. Registrarse normalmente desde la web del salón.
--        b. Confirmar el correo.
--        c. Ejecutar en SQL Editor:
--             update public.perfiles
--             set rol = 'admin'
--             where email = 'tu@correo.com';
--
--   3. Configurar variables de entorno en Vercel:
--        VITE_SUPABASE_URL     → Project Settings → API → Project URL
--        VITE_SUPABASE_ANON_KEY → Project Settings → API → anon key
--
-- ════════════════════════════════════════════════════════════
