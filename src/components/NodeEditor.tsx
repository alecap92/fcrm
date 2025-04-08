import React, { useState } from "react";
import { useWorkflowStore } from "../store/workflow";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface NodeEditorProps {
  nodeId: string;
  type: string;
  data: any;
  onClose: () => void;
}

interface Variable {
  name: string;
  description: string;
  example: string;
}

const availableVariables: Variable[] = [
  {
    name: "{{deal._id}}",
    description: "Deal ID",
    example: "507f1f77bcf86cd799439011",
  },
  { name: "{{deal.name}}", description: "Deal Name", example: "Big Sale Q1" },
  {
    name: "{{contact.email}}",
    description: "Contact Email",
    example: "john@example.com",
  },
  {
    name: "{{contact.name}}",
    description: "Contact Name",
    example: "John Doe",
  },
  { name: "{{status}}", description: "Current Status", example: "approved" },
  {
    name: "{{organization.name}}",
    description: "Organization Name",
    example: "Acme Inc",
  },
];

const VariableSelector = ({
  onSelect,
}: {
  onSelect: (variable: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Insert Variable
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Available Variables
            </h4>
            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <div
                  key={variable.name}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    onSelect(variable.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-mono text-blue-600">
                      {variable.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      e.g. {variable.example}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {variable.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const NodeEditor: React.FC<NodeEditorProps> = ({
  nodeId,
  type,
  data,
  onClose,
}) => {
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    data.date ? new Date(data.date) : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates: Record<string, string> = {};

    formData.forEach((value, key) => {
      updates[key] = value as string;
    });

    if (type === "datetime" && selectedDate) {
      updates.date = selectedDate.toISOString();
      updates.formattedDate = format(selectedDate, "PPpp");
    }

    updateNode(nodeId, updates);
    onClose();
  };

  const insertVariable = (fieldName: string, variable: string) => {
    const textarea = document.querySelector(
      `[name="${fieldName}"]`
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);

      textarea.value = before + variable + after;
      textarea.focus();
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
    }
  };

  const renderFields = () => {
    switch (type) {
      case "trigger":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trigger Type
              </label>
              <select
                name="triggerType"
                defaultValue={data.triggerType}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="database">Database Change</option>
              </select>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("recipient", v)}
                />
              </div>
              <input
                type="text"
                name="recipient"
                defaultValue={data.recipient}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="recipient@example.com or {{contact.email}}"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("subject", v)}
                />
              </div>
              <input
                type="text"
                name="subject"
                defaultValue={data.subject}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Email subject"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("content", v)}
                />
              </div>
              <textarea
                name="content"
                defaultValue={data.content}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Email content..."
              />
            </div>
          </div>
        );

      case "whatsapp":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("recipient", v)}
                />
              </div>
              <input
                type="tel"
                name="recipient"
                defaultValue={data.recipient}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="+1234567890 or {{contact.phone}}"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("message", v)}
                />
              </div>
              <textarea
                name="message"
                defaultValue={data.message}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="WhatsApp message..."
              />
            </div>
          </div>
        );

      case "webhook_trigger":
        return (
          <div className="space-y-5">
            <div></div>
            <label className=" text-sm font-medium text-gray-700">
              Webhook URL
            </label>
            <p>https://example.com/webhook</p>
          </div>
        );

      case "contacts":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Contact ID
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("contact", v)}
                />
              </div>
              <input
                type="text"
                name="contact"
                defaultValue={data.contact}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Contact ID or {{contact._id}}"
              />
            </div>
          </div>
        );

      case "http":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <VariableSelector onSelect={(v) => insertVariable("url", v)} />
              </div>
              <input
                type="url"
                name="url"
                defaultValue={data.url}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Method
              </label>
              <select
                name="method"
                defaultValue={data.method || "GET"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Headers
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("headers", v)}
                />
              </div>
              <textarea
                name="headers"
                defaultValue={data.headers}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <VariableSelector onSelect={(v) => insertVariable("body", v)} />
              </div>
              <textarea
                name="body"
                defaultValue={data.body}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Request body..."
              />
            </div>
          </div>
        );

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <VariableSelector
                  onSelect={(v) => insertVariable("condition", v)}
                />
              </div>
              <textarea
                name="condition"
                defaultValue={data.condition}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="{{contact.email}} !== undefined"
              />
            </div>
          </div>
        );

      case "datetime":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Action Type
              </label>
              <select
                name="actionType"
                defaultValue={data.actionType || "delay"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="delay">Delay</option>
                <option value="schedule">Schedule for Date</option>
                <option value="businessHours">Check Business Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date and Time
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholderText="Select date and time"
              />
            </div>
            {data.actionType === "businessHours" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="businessHoursStart"
                      defaultValue={data.businessHoursStart || "09:00"}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="businessHoursEnd"
                      defaultValue={data.businessHoursEnd || "17:00"}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Working Days
                  </label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`workingDays.${day.toLowerCase()}`}
                            defaultChecked={
                              data.workingDays?.[day.toLowerCase()] ??
                              ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day)
                            }
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            {day}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "deals_trigger":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Pipeline
              </label>
              <select
                name="pipeline"
                defaultValue={data.pipeline}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select From Stage
              </label>
              <select
                name="stage"
                defaultValue={data.stage}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="prospecting">Prospecting</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select To Stage
              </label>
              <select
                name="toStage"
                defaultValue={data.toStage}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="prospecting">Prospecting</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
                <option value="won">Won</option>
              </select>
            </div>
          </div>
        );

      case "delay":
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay Duration
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="duration"
                  defaultValue={data.duration}
                  className="pl-3 pr-12 py-2.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="e.g., 10m, 2h, 1d"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm">
                  <span>Duration</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: 10m (minutes), 2h (hours), 1d (days)
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">
              No fields available for this node type. Check the node type
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Configure {type}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">{renderFields()}</div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
