import type { NotaCreditoItem } from "../../types/notaCredito";

interface ValidationError {
  field: string;
  message: string;
}

export class NotaCreditoValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('Validación de nota de crédito fallida');
    this.name = 'NotaCreditoValidationError';
  }
}

// Validar un item individual de nota de crédito
export const validateNotaCreditoItem = (item: NotaCreditoItem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.description || item.description.trim() === "") {
    errors.push("La descripción del ítem es requerida");
  }

  if (!item.invoiced_quantity || Number(item.invoiced_quantity) <= 0) {
    errors.push("La cantidad debe ser mayor a 0");
  }

  if (!item.price_amount || Number(item.price_amount) < 0) {
    errors.push("El precio unitario no puede ser negativo");
  }

  if (!item.code || item.code.trim() === "") {
    errors.push("El código del ítem es requerido");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar la nota de crédito completa
export const validateNotaCredito = (data: {
  customer: any;
  items: NotaCreditoItem[];
  fecha: string;
  noFactura: string;
  razonDevolucion: string;
  fechaFactura: string;
  clienteFactura: {
    identification_number: number;
    name: string;
  };
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar cliente
  if (!data.customer) {
    errors.push({ field: "customer", message: "Debe seleccionar un cliente" });
  } else {
    if (!data.customer.identification_number) {
      errors.push({ field: "customer.identification_number", message: "El número de identificación del cliente es requerido" });
    }
    if (!data.customer.name) {
      errors.push({ field: "customer.name", message: "El nombre del cliente es requerido" });
    }
    
    // Validar coincidencia con cliente de factura
    if (data.customer.identification_number !== data.clienteFactura.identification_number) {
      errors.push({ field: "customer.identification_number", message: "El número de identificación del cliente debe coincidir con el de la factura" });
    }
    if (data.customer.name !== data.clienteFactura.name) {
      errors.push({ field: "customer.name", message: "El nombre del cliente debe coincidir con el de la factura" });
    }
  }

  // Validar items
  if (!data.items || data.items.length === 0) {
    errors.push({ field: "items", message: "Debe agregar al menos un ítem" });
  } else {
    data.items.forEach((item, index) => {
      const itemValidation = validateNotaCreditoItem(item);
      if (!itemValidation.isValid) {
        itemValidation.errors.forEach(error => {
          errors.push({ field: `items[${index}]`, message: error });
        });
      }
    });
  }

  // Validar fecha
  if (!data.fecha) {
    errors.push({ field: "fecha", message: "La fecha es requerida" });
  } else {
    const fechaNotaCredito = new Date(data.fecha);
    const fechaFactura = new Date(data.fechaFactura);
    
    if (fechaNotaCredito < fechaFactura) {
      errors.push({ field: "fecha", message: "La fecha de la nota de crédito debe ser posterior a la fecha de la factura" });
    }
  }

  // Validar número de factura
  if (!data.noFactura || data.noFactura.trim() === "") {
    errors.push({ field: "noFactura", message: "El número de factura es requerido" });
  }

  // Validar razón de devolución
  if (!data.razonDevolucion || data.razonDevolucion.trim() === "") {
    errors.push({ field: "razonDevolucion", message: "La razón de devolución es requerida" });
  }

  return errors;
};

// Validar totales de la nota de crédito
export const validateNotaCreditoTotals = (items: NotaCreditoItem[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  const total = items.reduce((sum, item) => {
    const quantity = Number(item.invoiced_quantity) || 0;
    const price = Number(item.price_amount) || 0;
    return sum + (quantity * price);
  }, 0);

  if (total <= 0) {
    errors.push({ field: "total", message: "El total de la nota de crédito debe ser mayor a 0" });
  }

  return errors;
};

// Función de utilidad para mostrar errores de validación
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.message}`).join("\n");
}; 