import React, { useState } from "react";
import { DollarSign, PieChart, Plus, X } from "lucide-react";

interface BudgetItem {
  id: string;
  channel: string;
  allocation: number;
}

const Budget: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: "1",
      channel: "Paid Search",
      allocation: 5000,
    },
    {
      id: "2",
      channel: "Social Media",
      allocation: 3000,
    },
    {
      id: "3",
      channel: "Content Marketing",
      allocation: 2000,
    },
    {
      id: "4",
      channel: "Email Marketing",
      allocation: 1000,
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [editForm, setEditForm] = useState({
    channel: "",
    allocation: 0,
  });

  const totalBudget = budgetItems.reduce(
    (sum, item) => sum + item.allocation,
    0
  );

  const handleSelectItem = (item: BudgetItem) => {
    setSelectedItem(item);
    setEditForm({
      channel: item.channel,
      allocation: item.allocation,
    });
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setEditForm({
      channel: "",
      allocation: 0,
    });
  };

  const handleSave = () => {
    if (selectedItem) {
      // Update existing item
      setBudgetItems((items) =>
        items.map((item) =>
          item.id === selectedItem.id ? { ...item, ...editForm } : item
        )
      );
    } else {
      // Add new item
      setBudgetItems((items) => [
        ...items,
        {
          id: Date.now().toString(),
          ...editForm,
        },
      ]);
    }
    setSelectedItem(null);
    setEditForm({ channel: "", allocation: 0 });
  };

  const handleDelete = (id: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
      setEditForm({ channel: "", allocation: 0 });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Budget
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Budget Allocation Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Budget Allocation
              </h2>
              <button
                onClick={handleNewItem}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Channel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Channel
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Allocated
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
                        selectedItem?.id === item.id
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {item.channel}
                      </td>
                      <td className="py-4 px-4 text-sm text-right text-gray-900 dark:text-white">
                        ${item.allocation.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 h-fit sticky top-24">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {selectedItem ? "Edit Channel" : "Add New Channel"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              value={editForm.channel}
              onChange={(e) =>
                setEditForm({ ...editForm, channel: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Paid Search"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Allocation
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={editForm.allocation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    allocation: Number(e.target.value),
                  })
                }
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setSelectedItem(null);
                setEditForm({ channel: "", allocation: 0 });
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {selectedItem ? "Update" : "Add"} Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
