import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
import contactList, { exportList } from "../services/contactListService";
import { IContactList } from "../types/contactList";
import contactListService from "../services/contactListService";

const dummyLists: IContactList[] = [
  {
    _id: "1",
    name: "Clientes VIP",
    description: "Lista de clientes premium con alto valor",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-20T15:45:00Z",
    filter: "",
    contactIds: ["1", "2", "3"],
    isDynamic: false,
    userId: false,
    organizationId: "org1",
  },
];

export function ContactLists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lists, setLists] = useState(dummyLists);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchLists = async () => {
    try {
      const response = await contactList.getContactList();
      setLists(response.data);
    } catch (error) {
      console.error("Error fetching contact lists:", error);
    }
  };

  const searchList = (term: string) => {
    if (term) {
      const filteredLists = lists.filter((list) =>
        list.name.toLowerCase().includes(term.toLowerCase())
      );
      setLists(filteredLists);
    } else {
      setLists(dummyLists);
    }
  };

  const handleExport = async (listId: string) => {
    await exportList(listId);

    setActiveMenu(null);
  };

  const handleDelete = async (listId: string) => {
    try {
      await contactListService.deleteContactList(listId);
      setLists((prevLists) => prevLists.filter((list) => list._id !== listId));
    } catch (error) {
      console.error("Error deleting contact list:", error);
    }
  };

  useEffect(() => {
    searchList(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchLists();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest(".menu-container")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Grupos y Listas
            </h1>
            <Link to="/contacts/lists/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Lista
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar listas..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contactos
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists.map((list) => (
                  <tr key={list._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/contacts/lists/${list._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-action"
                      >
                        {list.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {list.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {list.contactIds.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(list.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative menu-container">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(
                                activeMenu === list._id ? null : list._id
                              );
                            }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {activeMenu === list._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleExport(list._id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Editar
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(list._id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
