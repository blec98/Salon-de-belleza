/* ===========================================================
   data.js - Datos del salón Belleza & Estilo
   Catálogo de servicios, promociones, testimonios, FAQ y blog
   Precios mid-tier Osorno 2026 (CLP)
   =========================================================== */

import { imgServicio, imgAntesDespues } from "../lib/imagenes.js";

// Información general del salón
export const INFO_SALON = {
  nombre: "Belleza & Estilo",
  direccion: "Av. Mackenna 850, Osorno, Región de Los Lagos",
  telefono: "+56 9 8765 4321",
  whatsapp: "56987654321", // formato wa.me
  correo: "contacto.bellezayestilo@yahoo.com",
  horario: "Lun a Sáb: 09:00 - 20:00 hrs",
  mision:
    "Realzar la belleza natural de cada persona, ofreciendo servicios profesionales con dedicación, calidez y los más altos estándares de calidad.",
  vision:
    "Ser el salón de belleza líder y referente en Osorno, reconocido por la excelencia, la innovación y el bienestar integral de nuestros clientes.",
  valores:
    "Profesionalismo, confianza, atención personalizada, higiene y pasión por hacer sentir bien a cada cliente.",
};

// Datos del estudiante / autor del proyecto
export const ESTUDIANTE = {
  nombre: "Bernardo Cárdenas Carrillo",
  github: "https://github.com/blec98",
  institucion: "INACAP",
  caso: "Caso de Estudio — Aplicación Web SPA",
};

// Estadísticas del salón (mostradas en hero)
// Coherencia: 5 años × ~85 clientas nuevas/mes ≈ 5.000 (mid-range Osorno)
export const ESTADISTICAS = [
  { valor: "+5", etiqueta: "años de experiencia", icono: "bi-award" },
  { valor: "+5.000", etiqueta: "clientas felices", icono: "bi-people" },
  { valor: "100%", etiqueta: "productos profesionales", icono: "bi-patch-check" },
  { valor: "4.9", etiqueta: "calificación promedio", icono: "bi-star-fill" },
];

// Promociones / novedades
export const PROMOCIONES = [
  {
    titulo: "Combo Novia",
    descripcion:
      "Maquillaje de novia + peinado + manicure permanente. Desde $140.000 con 20% de descuento.",
    icono: "bi-gem",
    cta: "reservar",
  },
  {
    titulo: "Martes de Spa",
    descripcion:
      "Todos los martes, masajes relajantes y descontracturantes con 15% de descuento.",
    icono: "bi-flower1",
    cta: "reservar",
  },
  {
    titulo: "Pack Renovación",
    descripcion:
      "Corte de cabello + tratamiento facial por $55.000 (ahorra $7.000). Luce radiante.",
    icono: "bi-stars",
    cta: "cotizar",
  },
];

/* Catálogo de servicios.
   - "unidad": cómo se cobra (sesión, hora, servicio)
   - "precio": valor unitario en pesos chilenos (mid-tier Osorno 2026)
   - "duracionMin": duración estimada en minutos (para reservas)
   - "destacado": true si aparece en "servicios destacados" del Inicio
*/
export const SERVICIOS = [
  {
    id: 1,
    nombre: "Corte de Cabello Dama",
    categoria: "Cabello",
    descripcion:
      "Corte personalizado según tu estilo y tipo de rostro. Incluye lavado, secado y peinado final.",
    precio: 20000,
    unidad: "servicio",
    duracionMin: 40,
    destacado: true,
    imagen: imgServicio("corte-cabello-dama.webp"),
  },
  {
    id: 2,
    nombre: "Corte de Cabello Caballero",
    categoria: "Cabello",
    descripcion:
      "Corte clásico o moderno con máquina y tijera. Incluye perfilado de barba y peinado.",
    precio: 12000,
    unidad: "servicio",
    duracionMin: 30,
    destacado: false,
    imagen: imgServicio("corte-cabello-caballero.webp"),
  },
  {
    id: 3,
    nombre: "Tratamiento Facial",
    categoria: "Facial",
    descripcion:
      "Limpieza profunda, exfoliación, mascarilla e hidratación. Devuelve luminosidad a tu piel.",
    precio: 42000,
    unidad: "sesión",
    duracionMin: 75,
    destacado: true,
    imagen: imgServicio("tratamiento-facial.webp"),
  },
  {
    id: 4,
    nombre: "Manicure Tradicional",
    categoria: "Uñas",
    descripcion:
      "Cuidado completo de manos y uñas con esmaltado tradicional. Limado, cutícula e hidratación.",
    precio: 15000,
    unidad: "servicio",
    duracionMin: 45,
    destacado: false,
    imagen: imgServicio("manicure-tradicional.webp"),
  },
  {
    id: 5,
    nombre: "Manicure Permanente",
    categoria: "Uñas",
    descripcion:
      "Esmalte semipermanente que dura hasta 3 semanas. Acabado brillante y resistente.",
    precio: 22000,
    unidad: "servicio",
    duracionMin: 60,
    destacado: true,
    imagen: imgServicio("manicure-permanente.webp"),
  },
  {
    id: 6,
    nombre: "Pedicure",
    categoria: "Uñas",
    descripcion:
      "Tratamiento relajante para pies. Exfoliación, hidratación, limado y esmaltado tradicional.",
    precio: 18000,
    unidad: "servicio",
    duracionMin: 50,
    destacado: false,
    imagen: imgServicio("pedicure.webp"),
  },
  {
    id: 7,
    nombre: "Depilación Axilas",
    categoria: "Depilación",
    descripcion: "Depilación con cera profesional tibia. Suavidad y cuidado en piel sensible.",
    precio: 8000,
    unidad: "servicio",
    duracionMin: 15,
    destacado: false,
    imagen: imgServicio("depilacion-axilas.webp"),
  },
  {
    id: 8,
    nombre: "Depilación Medias Piernas",
    categoria: "Depilación",
    descripcion: "Depilación con cera de rodilla hacia abajo. Resultado duradero y prolijo.",
    precio: 14000,
    unidad: "servicio",
    duracionMin: 30,
    destacado: false,
    imagen: imgServicio("depilacion-medias-piernas.webp"),
  },
  {
    id: 9,
    nombre: "Depilación Piernas Completas",
    categoria: "Depilación",
    descripcion: "Depilación con cera desde la ingle hasta el tobillo. Incluye empeines y dedos.",
    precio: 22000,
    unidad: "servicio",
    duracionMin: 45,
    destacado: false,
    imagen: imgServicio("depilacion-piernas-completas.webp"),
  },
  {
    id: 10,
    nombre: "Depilación Bikini",
    categoria: "Depilación",
    descripcion: "Depilación de zona bikini con cera profesional. Discreción y profesionalismo.",
    precio: 12000,
    unidad: "servicio",
    duracionMin: 20,
    destacado: false,
    imagen: imgServicio("depilacion-bikini.webp"),
  },
  {
    id: 11,
    nombre: "Depilación Rostro (bozo / cejas)",
    categoria: "Depilación",
    descripcion: "Diseño y depilación de cejas o bozo con cera o pinza, según tu preferencia.",
    precio: 7000,
    unidad: "servicio",
    duracionMin: 15,
    destacado: false,
    imagen: imgServicio("depilacion-rostro.webp"),
  },
  {
    id: 12,
    nombre: "Maquillaje Profesional",
    categoria: "Maquillaje",
    descripcion:
      "Maquillaje para eventos, fiestas o sesiones fotográficas. Larga duración con productos premium.",
    precio: 55000,
    unidad: "servicio",
    duracionMin: 60,
    destacado: true,
    imagen: imgServicio("maquillaje-profesional.webp"),
  },
  {
    id: 13,
    nombre: "Maquillaje de Novia",
    categoria: "Maquillaje",
    descripcion:
      "Maquillaje a prueba de lágrimas con productos de alta gama. Incluye prueba previa.",
    precio: 110000,
    unidad: "servicio",
    duracionMin: 120,
    destacado: true,
    imagen: imgServicio("maquillaje-novia.webp"),
  },
  {
    id: 14,
    nombre: "Masaje Relajante",
    categoria: "Bienestar",
    descripcion: "Masaje corporal con aceites aromáticos para liberar tensión y reducir estrés.",
    precio: 35000,
    unidad: "hora",
    duracionMin: 60,
    destacado: true,
    imagen: imgServicio("masaje-relajante.webp"),
  },
  {
    id: 15,
    nombre: "Masaje Descontracturante",
    categoria: "Bienestar",
    descripcion:
      "Masaje terapéutico profundo para descontracturar zonas de tensión muscular crónica.",
    precio: 40000,
    unidad: "hora",
    duracionMin: 60,
    destacado: false,
    imagen: imgServicio("masaje-descontracturante.webp"),
  },
  {
    id: 16,
    nombre: "Coloración / Tintura",
    categoria: "Cabello",
    descripcion:
      "Tintura profesional con productos sin amoníaco. Incluye lavado y peinado final.",
    precio: 38000,
    unidad: "servicio",
    duracionMin: 90,
    destacado: false,
    imagen: imgServicio("coloracion-tintura.webp"),
  },
  {
    id: 17,
    nombre: "Mechas / Balayage",
    categoria: "Cabello",
    descripcion:
      "Técnica de iluminación con mechas o balayage. Resultado natural y luminoso.",
    precio: 75000,
    unidad: "servicio",
    duracionMin: 180,
    destacado: false,
    imagen: imgServicio("balayage.webp"),
  },
  {
    id: 18,
    nombre: "Alisado / Keratina",
    categoria: "Cabello",
    descripcion:
      "Tratamiento de keratina que alisa, repara y aporta brillo. Dura hasta 3 meses.",
    precio: 65000,
    unidad: "sesión",
    duracionMin: 150,
    destacado: false,
    imagen: imgServicio("alisado-keratina.webp"),
  },
  {
    id: 19,
    nombre: "Peinado para Eventos",
    categoria: "Cabello",
    descripcion:
      "Peinado de gala con recogido, ondas o trenzas. Para matrimonios, graduaciones y fiestas.",
    precio: 28000,
    unidad: "servicio",
    duracionMin: 60,
    destacado: false,
    imagen: imgServicio("peinado-eventos.webp"),
  },
];

// Profesionales del salón (para módulo de reservas)
export const PROFESIONALES = [
  {
    id: 1,
    nombre: "Catalina Rojas",
    especialidad: "Cabello y coloración",
    iniciales: "CR",
  },
  {
    id: 2,
    nombre: "Florencia Muñoz",
    especialidad: "Uñas y maquillaje",
    iniciales: "FM",
  },
  {
    id: 3,
    nombre: "Macarena Toledo",
    especialidad: "Facial y bienestar",
    iniciales: "MT",
  },
];

// Slots horarios disponibles (mock)
export const SLOTS_HORARIO = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
];

// Testimonios
export const TESTIMONIOS = [
  {
    nombre: "María José Hernández",
    servicio: "Maquillaje de Novia",
    calificacion: 5,
    comentario:
      "El maquillaje del día de mi matrimonio fue espectacular. Duró toda la jornada y las fotos quedaron preciosas. ¡Mil gracias al equipo!",
    iniciales: "MH",
  },
  {
    nombre: "Camila Vargas",
    servicio: "Mechas / Balayage",
    calificacion: 5,
    comentario:
      "Quedé encantada con las mechas. Carolina entendió exactamente lo que quería y el color quedó increíble. Vuelvo seguro.",
    iniciales: "CV",
  },
  {
    nombre: "Antonia Ríos",
    servicio: "Tratamiento Facial",
    calificacion: 5,
    comentario:
      "Salí con la piel renovada. El ambiente es super relajante y los productos que usan son de excelente calidad.",
    iniciales: "AR",
  },
  {
    nombre: "Fernanda Soto",
    servicio: "Manicure Permanente",
    calificacion: 5,
    comentario:
      "Me dura más de 3 semanas sin saltarse. Valentina tiene una pulcritud impresionante con los detalles.",
    iniciales: "FS",
  },
  {
    nombre: "Paulina Mella",
    servicio: "Masaje Descontracturante",
    calificacion: 5,
    comentario:
      "Iba con la espalda destruida del trabajo. Una sesión y quedé como nueva. Recomiendo 100%.",
    iniciales: "PM",
  },
  {
    nombre: "Isidora Cárcamo",
    servicio: "Corte de Cabello Dama",
    calificacion: 4,
    comentario:
      "Me encantó cómo cortaron mi cabello. La atención es muy cálida y el lugar muy limpio.",
    iniciales: "IC",
  },
];

// Galería antes/después: solo casos donde el "antes" y el "después"
// muestran genuinamente una transformación. Si más adelante se obtienen
// pares reales del salón, se agregan aquí.
export const ANTES_DESPUES = [
  {
    id: 1,
    titulo: "Alisado / Keratina",
    antes: imgAntesDespues("alisado-keratina-antes.webp"),
    despues: imgAntesDespues("alisado-keratina-despues.webp"),
  },
  {
    id: 2,
    titulo: "Depilación Medias Piernas",
    antes: imgAntesDespues("depilacion-medias-piernas-antes.webp"),
    despues: imgAntesDespues("depilacion-medias-piernas-despues.webp"),
  },
  {
    id: 3,
    titulo: "Pedicure",
    antes: imgAntesDespues("pedicure-antes.webp"),
    despues: imgAntesDespues("pedicure-despues.webp"),
  },
];

// Preguntas frecuentes
export const FAQ = [
  {
    pregunta: "¿Cómo agendo una cita?",
    respuesta:
      "Puedes reservar directamente desde la sección 'Reservar' de este sitio, llamarnos al teléfono del salón o escribirnos por WhatsApp. Te confirmaremos el horario en menos de 1 hora hábil.",
  },
  {
    pregunta: "¿Cuál es la política de cancelación?",
    respuesta:
      "Puedes cancelar o reagendar tu cita sin costo hasta 6 horas antes de la hora reservada. Cancelaciones tardías reiteradas pueden requerir un abono al momento de agendar.",
  },
  {
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta:
      "Aceptamos efectivo, débito, crédito (Visa, Mastercard, AMEX), transferencia bancaria y MACH. Las cuotas sin interés están sujetas al banco emisor.",
  },
  {
    pregunta: "¿Qué marcas de productos utilizan?",
    respuesta:
      "Trabajamos con L'Oréal Professionnel, Wella Professionals y Schwarzkopf para cabello, y marcas premium para maquillaje y skincare. Todos productos profesionales certificados.",
  },
  {
    pregunta: "¿Atienden hombres?",
    respuesta:
      "Sí. Tenemos servicios específicos como Corte de Cabello Caballero, y los servicios de bienestar, depilación y manicure están abiertos a todos los géneros.",
  },
  {
    pregunta: "¿Reciben niños?",
    respuesta:
      "Sí, atendemos cortes infantiles bajo cita previa. Te pedimos avisar al reservar para asignar al estilista con experiencia con niños/as.",
  },
  {
    pregunta: "¿Cuánto antes debo reservar maquillaje de novia?",
    respuesta:
      "Idealmente con 2-3 meses de anticipación. Incluimos una prueba previa para definir el look y asegurar que todo salga perfecto el día del matrimonio.",
  },
  {
    pregunta: "¿Tienen estacionamiento?",
    respuesta:
      "Contamos con estacionamiento gratuito para clientas en el costado del salón. También hay parquímetros públicos en la cuadra.",
  },
];

/* Posts del blog: curaduría de artículos externos verificados.
   Cada entrada enlaza a un artículo real de un medio o blog profesional.
   El resumen es nuestro (Belleza & Estilo) recomendando por qué leerlo.
   Para agregar uno nuevo: verificar URL (200 OK), conseguir título/autor/fecha
   reales, escribir 1-2 líneas curatoriales propias. */
export const POSTS_BLOG = [
  {
    slug: "cortes-pelo-primavera-2026",
    titulo: "12 cortes de pelo diferentes que están marcando esta primavera 2026",
    fuente: "¡Hola!",
    autor: "Celia Mediavilla",
    fecha: "2026-04-30",
    categoria: "Cabello",
    resumen:
      "Doce propuestas de corte para esta temporada, desde el flequillo cortina hasta el halo rizado. Nos sirve para ayudarte a elegir el que va con tu rostro y tu rutina.",
    url: "https://www.hola.com/belleza/20260430896640/cortes-de-pelo-tendencia-primavera-2026/",
    imagen: imgServicio("corte-cabello-dama.webp"),
    destacado: true,
  },
  {
    slug: "tendencias-unas-2026",
    titulo: "Las 10 mejores tendencias de uñas en 2026",
    fuente: "ProNails",
    autor: "Equipo ProNails",
    fecha: "2025-12-05",
    categoria: "Uñas",
    resumen:
      "Jelly nails, perlados, florales sutiles, berry tones y nudes cremosos: las técnicas que estamos viendo dominar en los salones este año.",
    url: "https://pronails.es/es/naily-news/nail-trends-2026",
    imagen: imgServicio("manicure-permanente.webp"),
    destacado: true,
  },
  {
    slug: "rutina-facial-tipos-piel",
    titulo: "Rutina de cuidado facial según los tipos de piel",
    fuente: "Eucerin",
    autor: "Eucerin México",
    fecha: "2025-01-01",
    categoria: "Facial",
    resumen:
      "Una guía clara para reconocer si tu piel es seca, grasa, mixta o sensible, y armar la rutina mínima que sí funciona. La constancia importa más que la cantidad de productos.",
    url: "https://www.eucerin.com.mx/acerca-de-la-piel/indicaciones/rutina-para-todos-los-tipos-de-piel",
    imagen: imgServicio("tratamiento-facial.webp"),
    destacado: false,
  },
  {
    slug: "tendencias-maquillaje-pasarelas-2026",
    titulo: "Las mayores tendencias de maquillaje para 2026, directo desde las pasarelas",
    fuente: "Harper's Bazaar",
    autor: "Katie Intner",
    fecha: "2025-10-17",
    categoria: "Maquillaje",
    resumen:
      "Ojos dorados, blush rosa intenso, smokey moderno y gemas faciales. Inspiración directa de las pasarelas para tus próximos eventos.",
    url: "https://www.harpersbazaar.com.ec/belleza/las-mayores-tendencias-maquillaje-2026-directo-pasarelas-n256",
    imagen: imgServicio("maquillaje-profesional.webp"),
    destacado: false,
  },
  {
    slug: "tendencias-novia-2026",
    titulo: "Tendencias de maquillaje y peluquería para las novias de 2026",
    fuente: "Lucía se Casa",
    autor: "María Jesús Urra",
    fecha: "2025-05-07",
    categoria: "Maquillaje",
    resumen:
      "Lo que se vio en Barcelona Bridal Fashion Week: piel natural realzada, blush protagonista y peinados con textura. Si te casas en 2026, esto te interesa.",
    url: "https://luciasecasa.com/tendencias/tendencias-de-maquillaje-y-peluqueria-para-las-novias-de-2026/",
    imagen: imgServicio("maquillaje-novia.webp"),
    destacado: true,
  },
  {
    slug: "beneficios-masaje-relajante",
    titulo: "7 beneficios de los masajes relajantes para cuerpo y mente",
    fuente: "Ambrosia Spa",
    autor: "Equipo Ambrosia",
    fecha: "2023-06-01",
    categoria: "Bienestar",
    resumen:
      "Por qué un masaje no es un lujo: reducción real de ansiedad, mejor circulación y sueño más profundo. Razones para incluirlo en tu rutina.",
    url: "https://ambrosiaspabcn.com/7-beneficios-de-los-masajes-relajantes-para-cuerpo-y-mente/",
    imagen: imgServicio("masaje-relajante.webp"),
    destacado: false,
  },
];


// Sitios de referencia (marcas de productos usados)
export const SITIOS_REFERENCIA = [
  { nombre: "L'Oréal Professionnel", url: "https://www.loreal-paris.cl" },
  { nombre: "Wella Professionals", url: "https://www.wella.com" },
  { nombre: "Schwarzkopf", url: "https://www.schwarzkopf.com" },
];

// Helper para formatear precios en pesos chilenos
export function formatoCLP(valor) {
  return "$" + valor.toLocaleString("es-CL");
}

// Categorías disponibles (derivadas de SERVICIOS)
export const CATEGORIAS = [
  "Todos",
  "Cabello",
  "Facial",
  "Uñas",
  "Depilación",
  "Maquillaje",
  "Bienestar",
];
