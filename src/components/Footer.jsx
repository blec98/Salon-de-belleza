/* ===========================================================
   Footer.jsx - Pie de página
   =========================================================== */

import { INFO_SALON, SITIOS_REFERENCIA, ESTUDIANTE } from "../data/data.js";

function Footer({ navegar }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-4">

          {/* Información del salón */}
          <div className="col-lg-5 col-md-6">
            <h5>
              <i className="bi bi-flower2 me-2" aria-hidden="true"></i>
              {INFO_SALON.nombre}
            </h5>
            <p className="small mb-1">
              <i className="bi bi-geo-alt me-2" aria-hidden="true"></i>
              {INFO_SALON.direccion}
            </p>
            <p className="small mb-1">
              <i className="bi bi-telephone me-2" aria-hidden="true"></i>
              {INFO_SALON.telefono}
            </p>
            <p className="small mb-1">
              <i className="bi bi-envelope me-2" aria-hidden="true"></i>
              {INFO_SALON.correo}
            </p>
            <p className="small mb-0">
              <i className="bi bi-clock me-2" aria-hidden="true"></i>
              {INFO_SALON.horario}
            </p>
          </div>

          {/* Redes sociales + ubicación */}
          <div className="col-lg-3 col-md-6">
            <h5>Síguenos</h5>
            <div className="mb-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-ico"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram" aria-hidden="true"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-ico"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook" aria-hidden="true"></i>
              </a>
              <a
                href={`https://wa.me/${INFO_SALON.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-ico"
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp" aria-hidden="true"></i>
              </a>
              <a
                href={ESTUDIANTE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-ico"
                aria-label="GitHub"
              >
                <i className="bi bi-github" aria-hidden="true"></i>
              </a>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av+Mackenna+850+Osorno+Chile"
              target="_blank"
              rel="noopener noreferrer"
              className="small"
            >
              <i className="bi bi-map me-2" aria-hidden="true"></i>
              Ver en Google Maps
            </a>
            <div className="mt-3">
              <button
                className="link-footer small"
                onClick={() => navegar("mis-reservas")}
              >
                <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
                Mis reservas
              </button>
            </div>
          </div>

          {/* Sitios de referencia */}
          <div className="col-lg-4 col-md-6">
            <h5>Marcas que usamos</h5>
            <ul className="list-unstyled">
              {SITIOS_REFERENCIA.map((s, i) => (
                <li className="mb-2" key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    <i
                      className="bi bi-box-arrow-up-right me-2"
                      aria-hidden="true"
                    ></i>
                    {s.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom text-center">
          <div className="mb-2">
            © {new Date().getFullYear()} {INFO_SALON.nombre} — Osorno, Chile.
            Todos los derechos reservados.
          </div>
          <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <i className="bi bi-mortarboard me-2" aria-hidden="true"></i>
            Proyecto desarrollado por{" "}
            <strong style={{ color: "#fff" }}>{ESTUDIANTE.nombre}</strong> —{" "}
            {ESTUDIANTE.institucion} ·{" "}
            <a
              href={ESTUDIANTE.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-github me-1" aria-hidden="true"></i>
              github.com/blec98
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
