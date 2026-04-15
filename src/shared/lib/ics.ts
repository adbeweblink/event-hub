/** Generate and download a .ics calendar file */
export function downloadICS({
  title,
  description,
  startDate,
  startTime,
  endTime,
  location,
}: {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  location?: string;
}) {
  const dateStr = startDate.replace(/-/g, "");
  const start = `${dateStr}T${startTime.replace(":", "")}00`;
  const end = `${dateStr}T${endTime.replace(":", "")}00`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Hub//Event//EN",
    "BEGIN:VEVENT",
    `DTSTART;TZID=Asia/Taipei:${start}`,
    `DTEND;TZID=Asia/Taipei:${end}`,
    `DTSTAMP:${now}`,
    `UID:${Date.now()}@event-hub`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    location ? `LOCATION:${location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "event"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
