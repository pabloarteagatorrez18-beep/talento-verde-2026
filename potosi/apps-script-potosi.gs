const SPREADSHEET_ID = "11Bg9ZSVsS5hYNH5P4ZQdP9TUIAFKQgwgAVdYgw-PQ60";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Talento Verde Potosí 2026" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const params = e && e.parameter ? e.parameter : {};
    const multi = e && e.parameters ? e.parameters : {};
    const tipo = String(params.tipo_registro || "").trim().toLowerCase();
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (tipo === "empresa") {
      const sheet = spreadsheet.getSheetByName("Empresas");
      if (!sheet) throw new Error("No existe la hoja Empresas");

      const carreras = (multi.carreras_interes || []).map(String).filter(Boolean).join(" | ");
      sheet.appendRow([
        params.fecha_registro || new Date().toISOString(),
        "empresa",
        params.empresa || "",
        params.nombre_participante || "",
        params.correo || "",
        params.telefono || "",
        carreras,
        params.habilidad_deseada || "",
        params.cantidad_practicantes || "",
      ]);
    } else if (tipo === "estudiante") {
      const sheet = spreadsheet.getSheetByName("Estudiantes");
      if (!sheet) throw new Error("No existe la hoja Estudiantes");

      sheet.appendRow([
        params.fecha_registro || new Date().toISOString(),
        "estudiante",
        params.nombre || "",
        params.apellido || "",
        params.telefono || "",
        params.correo || "",
        params.instituto || "",
        params.carrera || "",
        params.anio_carrera || "",
      ]);
    } else {
      throw new Error("tipo_registro no válido");
    }

    SpreadsheetApp.flush();
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error && error.message ? error.message : error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
