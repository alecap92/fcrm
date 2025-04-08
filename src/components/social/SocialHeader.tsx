import React from "react";
import { CalendarIcon, Grid, Plus, Search, Filter } from "lucide-react";
import { Button } from "../ui/button";

interface SocialHeaderProps {
  view: "calendar" | "grid";
  setView: (view: "calendar" | "grid") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
}

export const SocialHeader: React.FC<SocialHeaderProps> = ({
  view,
  setView,
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  setShowCreateModal,
}) => {
  return (
    <div className="bg-white border-b">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Social Media
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan and schedule your social media content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-1 flex items-center">
              <button
                className={`p-1.5 rounded ${
                  view === "calendar" ? "bg-white shadow" : "hover:bg-white/50"
                }`}
                onClick={() => setView("calendar")}
                title="Vista Calendario"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                className={`p-1.5 rounded ${
                  view === "grid" ? "bg-white shadow" : "hover:bg-white/50"
                }`}
                onClick={() => setView("grid")}
                title="Vista Cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Publicación
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar publicaciones..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="rounded-lg border-gray-300">
                <option>Todas las plataformas</option>
                <option>Instagram</option>
                <option>Facebook</option>
              </select>
              <select className="rounded-lg border-gray-300">
                <option>Todos los estados</option>
                <option>Borrador</option>
                <option>Programado</option>
                <option>Publicado</option>
              </select>
              <select className="rounded-lg border-gray-300">
                <option>Todas las fechas</option>
                <option>Hoy</option>
                <option>Esta semana</option>
                <option>Este mes</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
