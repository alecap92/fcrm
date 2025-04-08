import { useState, useMemo } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Instagram, Facebook, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import type { Post } from "../../types/social";

interface CalendarProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onSelectSlot: (start: Date) => void;
  onMovePost: (post: Post, start: Date) => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  post: Post;
  newDate: Date;
  onConfirm: () => void;
  onCancel: () => void;
}

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function ConfirmDialog({
  isOpen,
  post,
  newDate,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mover publicación
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              ¿Estás seguro de que quieres mover esta publicación a{" "}
              {format(newDate, "PPP p")}?
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {post.platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs"
              >
                {platform === "instagram" ? (
                  <Instagram className="w-3 h-3" />
                ) : (
                  <Facebook className="w-3 h-3" />
                )}
                {platform}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Mover publicación</Button>
        </div>
      </div>
    </div>
  );
}

const eventStyleGetter = (event: Post & { isDragging?: boolean }) => {
  let backgroundColor = "#E5E7EB"; // Default gray for drafts
  let borderColor = "#9CA3AF";

  switch (event.status) {
    case "scheduled":
      backgroundColor = "#DBEAFE";
      borderColor = "#3B82F6";
      break;
    case "published":
      backgroundColor = "#D1FAE5";
      borderColor = "#10B981";
      break;
    case "failed":
      backgroundColor = "#FEE2E2";
      borderColor = "#EF4444";
      break;
  }

  return {
    style: {
      backgroundColor,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: "4px",
      color: "#111827",
      padding: "2px 4px",
      opacity: event.isDragging ? 0.5 : 1,
      cursor: "move",
    },
  };
};

export function Calendar({
  posts,
  onSelectPost,
  onSelectSlot,
  onMovePost,
}: CalendarProps) {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<Post | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    post: Post | null;
    newDate: Date | null;
  }>({
    isOpen: false,
    post: null,
    newDate: null,
  });

  const events = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        title:
          post.content.substring(0, 50) +
          (post.content.length > 50 ? "..." : ""),
        start: new Date(post.scheduledFor),
        end: new Date(post.scheduledFor),
        allDay: false,
        isDragging: draggedEvent?._id === post._id,
      })),
    [posts, draggedEvent]
  );

  const handleDragStart = (event: Post) => {
    setDraggedEvent(event);
  };

  const handleDragEnd = (start: Date) => {
    if (draggedEvent) {
      // Round to nearest 15 minutes
      const minutes = start.getMinutes();
      const roundedMinutes = Math.round(minutes / 15) * 15;
      const roundedStart = addMinutes(
        new Date(start.setMinutes(0)),
        roundedMinutes
      );

      setConfirmDialog({
        isOpen: true,
        post: draggedEvent,
        newDate: roundedStart,
      });
      setDraggedEvent(null);
    }
  };

  const handleConfirmMove = () => {
    if (confirmDialog.post && confirmDialog.newDate) {
      onMovePost(confirmDialog.post, confirmDialog.newDate);
    }
    setConfirmDialog({ isOpen: false, post: null, newDate: null });
  };

  const handleCancelMove = () => {
    setConfirmDialog({ isOpen: false, post: null, newDate: null });
  };

  const CustomEvent = ({ event }: { event: Post & { title: string } }) => (
    <div
      className="flex flex-col h-full"
      draggable
      onDragStart={() => handleDragStart(event)}
    >
      <div className="flex items-center gap-1 mb-1">
        {event.platforms.includes("instagram") && (
          <Instagram className="w-3 h-3" />
        )}
        {event.platforms.includes("facebook") && (
          <Facebook className="w-3 h-3" />
        )}
      </div>
      <p className="text-xs line-clamp-2">{event.title}</p>
      {/* {event.media[0] && view !== Views.MONTH && (
        <img
          src={event.media[0].urls[0]}
          alt=""
          className="mt-1 w-full h-16 object-cover rounded"
        />
      )} */}
    </div>
  );

  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1 text-sm rounded-md hover:bg-gray-100"
        >
          Hoy
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          ‹
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          ›
        </button>
        <h2 className="text-lg font-semibold ml-2">{label}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(Views.MONTH)}
          className={`px-3 py-1 text-sm rounded-md ${
            view === Views.MONTH ? "bg-action text-white" : "hover:bg-gray-100"
          }`}
        >
          Mes
        </button>
        <button
          onClick={() => onView(Views.WEEK)}
          className={`px-3 py-1 text-sm rounded-md ${
            view === Views.WEEK ? "bg-action text-white" : "hover:bg-gray-100"
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => onView(Views.DAY)}
          className={`px-3 py-1 text-sm rounded-md ${
            view === Views.DAY ? "bg-action text-white" : "hover:bg-gray-100"
          }`}
        >
          Día
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow h-[calc(100vh-13rem)]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
        }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => !draggedEvent && onSelectPost(event as Post)}
        onSelectSlot={({ start }) => {
          if (draggedEvent) {
            handleDragEnd(start);
          } else {
            onSelectSlot(start);
          }
        }}
        selectable
        popup
        step={15}
        timeslots={4}
        messages={{
          today: "Hoy",
          previous: "Anterior",
          next: "Siguiente",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay publicaciones programadas",
          showMore: (total) => `+${total} más`,
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        post={confirmDialog.post!}
        newDate={confirmDialog.newDate!}
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  );
}
