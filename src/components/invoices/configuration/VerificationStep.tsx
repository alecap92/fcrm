import { useState } from "react";
import invoiceConfigurationService from "../../../services/invoiceConfigurationService";

const initialForm = {
  id: "",
  pin: "12345",
};

export function VerificationStep() {
  const [form, setForm] = useState(initialForm);
  const [formStatus, setFormStatus] = useState<undefined | boolean>(undefined);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log("click");
      await invoiceConfigurationService.configSoftware(form);
      setFormStatus(true);
    } catch (error) {
      console.error("Error in configSoftware: ", error);
      setFormStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {formStatus === true ? (
        <div
          className="bg-green-50 border-l-4 border-green-400 p-4"
          role="alert"
        >
          <p>Configuracion creada correctamente.</p>
        </div>
      ) : formStatus === false ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
          <p>
            Ha ocurrido un error al crear la configuracion, revise la consola.
          </p>
        </div>
      ) : null}
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-gray-700">
          ID Software{" "}
          <small> (No el de pruebas si no el que entrega la DIAN)</small>
        </label>
        <input
          type="text"
          name="id"
          id="id"
          value={form.id}
          onChange={onChange}
          placeholder="Enter your software ID"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="pin"
          className="block text-sm font-medium text-gray-700"
        >
          PIN
        </label>
        <input
          type="number"
          name="pin"
          id="pin"
          value={form.pin || ""}
          onChange={onChange}
          placeholder="Enter your PIN"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
}
