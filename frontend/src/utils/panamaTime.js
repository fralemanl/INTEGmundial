// Utilidad para obtener la fecha en hora de Panamá (America/Panama)
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function toPanamaTime(dateStr) {
  if (!dateStr) return "";
  try {
    return dayjs(dateStr).tz("America/Panama");
  } catch {
    return dayjs(dateStr);
  }
}

export function formatPanama(dateStr, format = "DD MMM YYYY HH:mm") {
  const d = toPanamaTime(dateStr);
  return d && d.isValid && d.isValid() ? d.format(format) : "";
}
