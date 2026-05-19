/* ===========================================================
   Stepper.jsx - Indicador de progreso para wizards
   Recibe pasos (array de etiquetas) y el índice del paso activo
   =========================================================== */

function Stepper({ pasos, pasoActivo }) {
  return (
    <div className="stepper" role="group" aria-label="Progreso del formulario">
      {pasos.map((etq, i) => {
        const completado = i < pasoActivo;
        const activo = i === pasoActivo;
        const clase =
          "stepper-paso" +
          (activo ? " activo" : "") +
          (completado ? " completado" : "");
        return (
          <div key={i} style={{ display: "contents" }}>
            <div className={clase}>
              <div className="stepper-numero" aria-hidden="true">
                {completado ? <i className="bi bi-check-lg"></i> : i + 1}
              </div>
              <span className="stepper-etiqueta">{etq}</span>
            </div>
            {i < pasos.length - 1 && <div className="stepper-linea" aria-hidden="true"></div>}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
