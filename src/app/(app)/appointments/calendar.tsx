"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";

type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
};

export function AppointmentsCalendar({ events }: { events: EventItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="fr"
        events={events}
        height="auto"
      />
    </div>
  );
}
