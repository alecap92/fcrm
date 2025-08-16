import { Clock, Filter, Mail, Phone, StickyNote, Users } from "lucide-react";
import { useState } from "react";
import { Activity } from "../../types/contact";

type ActivityListProps = {
  activities: Activity[];
  onSearchChange: (value: string) => void;
  searchValue: string;
  onCreate: () => void;
  onSelect: (a: Activity) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export default function ActivityList({ activities, onSearchChange, searchValue, onCreate, onSelect, onDelete, isLoading = false }: ActivityListProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = activities.filter((a) => {
    const byType = typeFilter === "all" || a.activityType === typeFilter;
    const byStatus = statusFilter === "all" || a.status === statusFilter;
    const byText = !searchValue || a.title.toLowerCase().includes(searchValue.toLowerCase());
    return byType && byStatus && byText;
  });
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="flex gap-2">
          <button
            onClick={onCreate}
            className="bg-indigo-600 text-white rounded-lg px-3 py-2 hover:bg-indigo-700 transition-colors text-sm"
          >
            New Quote
          </button>
          <button
            onClick={(e) => onCreate()}
            className="bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors text-sm"
          >
            Upload Doc
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar Actividad..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="Reunion">Reunión</option>
            <option value="Llamada">Llamada</option>
            <option value="Correo">Correo</option>
            <option value="Nota">Nota</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="incomplete">Pendiente</option>
            <option value="completed">Completada</option>
          </select>
          <button
            onClick={onCreate}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
          >
            Nueva
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="animate-pulse h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <div
              key={activity._id}
              className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSelect(activity)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {activity.activityType === "Reunion" && (
                    <Users className="h-4 w-4 text-blue-500" />
                  )}
                  {activity.activityType === "Llamada" && (
                    <Phone className="h-4 w-4 text-green-500" />
                  )}
                  {activity.activityType === "Correo" && (
                    <Mail className="h-4 w-4 text-red-500" />
                  )}
                  {activity.activityType === "Nota" && (
                    <StickyNote className="h-4 w-4 text-yellow-500" />
                  )}
                  <p className="text-gray-700">{activity.title}</p>
                  {activity.status ? (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activity.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {activity.status}
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(activity._id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {activity.date}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}


