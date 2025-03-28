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
} from "lucide-react";
import { Button } from "../components/ui/button";
import contactList from "../services/contactListService";
import { IContactList } from "../types/contactList";

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

  const fetchLists = async () => {
    try {
      const response = await contactList.getContactList();

      setLists(response);
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

  useEffect(() => {
    searchList(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchLists();
  }, []);

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
                      <div className="flex flex-wrap gap-1">
                        {/* {list.tags.map((tag:any) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-action/10 text-action"
                          >
                            <Tags className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))} */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(list.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
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
