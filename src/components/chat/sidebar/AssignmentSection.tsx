import React from "react";
import { User2 } from "lucide-react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface AssignmentSectionProps {
  employees: Employee[];
  assignedToId?: string;
  onEmployeeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  employees,
  assignedToId,
  onEmployeeChange,
}) => {
  return (
    <div className="border-b border-gray-200 pb-4 px-4">
      <div className="flex items-center">
        <User2 className="w-4 h-4 text-gray-500 mr-2" />
        <div className="flex flex-col py-3">
          <h3 className="font-semibold text-gray-900">Asignado a</h3>
        </div>
      </div>
      <div className="flex flex-col">
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          onChange={onEmployeeChange}
          value={assignedToId || ""}
        >
          <option value="">Seleccionar empleado</option>
          {employees.map((employee) => (
            <option value={employee._id} key={employee._id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
