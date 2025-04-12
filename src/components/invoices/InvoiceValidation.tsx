import type { Invoice, InvoiceItem } from "../../types/invoice";

export class InvoiceValidationError extends Error {
  errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super("Error de validación de factura");
    this.name = "InvoiceValidationError";
    this.errors = errors;
  }
}

export const validateInvoice = (invoice: Partial<Invoice>) => {
  const errors: Array<{ field: string; message: string }> = [];

  // Validar cliente
  if (!invoice.customer) {
    errors.push({
      field: "customer",
      message: "Debe seleccionar un cliente",
    });
  } else {
    // Validar campos del cliente
    if (!invoice.customer.identification_number) {
      errors.push({
        field: "customer.identification_number",
        message: "El número de identificación del cliente es requerido",
      });
    }

    if(!invoice.customer.dv){
      errors.push({
        field: "customer.dv",
        message: "El dígito de verificación del cliente es requerido",
      });
    }
    
    if (!invoice.customer.name || invoice.customer.name.trim() === "") {
      errors.push({
        field: "customer.name",
        message: "El nombre del cliente es requerido",
      });
    }
    

  }

  // Validar número de factura
  if (!invoice.number) {
    errors.push({
      field: "number",
      message: "El número de factura es requerido",
    });
  }

  // Validar prefijo
  if (!invoice.prefix || invoice.prefix.trim() === "") {
    errors.push({
      field: "prefix",
      message: "El prefijo de la factura es requerido",
    });
  }

  // Validar resolución
  if (!invoice.resolution_number || invoice.resolution_number.trim() === "") {
    errors.push({
      field: "resolution_number",
      message: "El número de resolución es requerido",
    });
  }

  // Validar fecha
  if (!invoice.date) {
    errors.push({
      field: "date",
      message: "La fecha de la factura es requerida",
    });
  }

  // Validar hora
  if (!invoice.time) {
    errors.push({
      field: "time",
      message: "La hora de la factura es requerida",
    });
  }

  // Validar líneas de factura
  if (!invoice.invoice_lines || invoice.invoice_lines.length === 0) {
    errors.push({
      field: "invoice_lines",
      message: "Debe agregar al menos un ítem a la factura",
    });
  } else {
    // Validar cada línea
    invoice.invoice_lines.forEach((line, index) => {
      if (!line.description || line.description.trim() === "") {
        errors.push({
          field: `invoice_lines[${index}].description`,
          message: `La descripción del ítem #${index + 1} es requerida`,
        });
      }
      
      if (!line.code || line.code.trim() === "") {
        errors.push({
          field: `invoice_lines[${index}].code`,
          message: `El código del ítem #${index + 1} es requerido`,
        });
      }
      
      if (!line.invoiced_quantity || parseFloat(line.invoiced_quantity) <= 0) {
        errors.push({
          field: `invoice_lines[${index}].invoiced_quantity`,
          message: `La cantidad del ítem #${index + 1} debe ser mayor a 0`,
        });
      }
      
      if (!line.price_amount || parseFloat(line.price_amount) < 0) {
        errors.push({
          field: `invoice_lines[${index}].price_amount`,
          message: `El precio del ítem #${index + 1} no puede ser negativo`,
        });
      }
    });
  }

  // Validar forma de pago
  if (!invoice.payment_form) {
    errors.push({
      field: "payment_form",
      message: "La forma de pago es requerida",
    });
  } else {
    if (!invoice.payment_form.payment_form_id) {
      errors.push({
        field: "payment_form.payment_form_id",
        message: "El ID de forma de pago es requerido",
      });
    }
    
    if (!invoice.payment_form.payment_method_id) {
      errors.push({
        field: "payment_form.payment_method_id",
        message: "El método de pago es requerido",
      });
    }
    
    if (!invoice.payment_form.payment_due_date) {
      errors.push({
        field: "payment_form.payment_due_date",
        message: "La fecha de vencimiento es requerida",
      });
    }
  }

  // Validar totales
  if (!invoice.legal_monetary_totals) {
    errors.push({
      field: "legal_monetary_totals",
      message: "Los totales monetarios legales son requeridos",
    });
  } else {
    // Validar que los totales sean valores válidos
    const totals = invoice.legal_monetary_totals;
    
    if (!totals.line_extension_amount || parseFloat(totals.line_extension_amount) < 0) {
      errors.push({
        field: "legal_monetary_totals.line_extension_amount",
        message: "El subtotal debe ser un valor válido",
      });
    }
    
    if (!totals.tax_exclusive_amount || parseFloat(totals.tax_exclusive_amount) < 0) {
      errors.push({
        field: "legal_monetary_totals.tax_exclusive_amount",
        message: "El valor sin impuestos debe ser un valor válido",
      });
    }
    
    if (!totals.tax_inclusive_amount || parseFloat(totals.tax_inclusive_amount) < 0) {
      errors.push({
        field: "legal_monetary_totals.tax_inclusive_amount",
        message: "El valor con impuestos debe ser un valor válido",
      });
    }
    
    if (!totals.payable_amount || parseFloat(totals.payable_amount) < 0) {
      errors.push({
        field: "legal_monetary_totals.payable_amount",
        message: "El total a pagar debe ser un valor válido",
      });
    }
  }

  // Validar impuestos
  if (!invoice.tax_totals || invoice.tax_totals.length === 0) {
    errors.push({
      field: "tax_totals",
      message: "Los totales de impuestos son requeridos",
    });
  } else {
    // Validar cada total de impuesto
    invoice.tax_totals.forEach((tax, index) => {
      if (!tax.tax_amount || parseFloat(tax.tax_amount) < 0) {
        errors.push({
          field: `tax_totals[${index}].tax_amount`,
          message: `El valor del impuesto #${index + 1} debe ser un valor válido`,
        });
      }
      
      if (!tax.percent || parseFloat(tax.percent) < 0) {
        errors.push({
          field: `tax_totals[${index}].percent`,
          message: `El porcentaje del impuesto #${index + 1} debe ser un valor válido`,
        });
      }
      
      if (!tax.taxable_amount || parseFloat(tax.taxable_amount) < 0) {
        errors.push({
          field: `tax_totals[${index}].taxable_amount`,
          message: `La base gravable del impuesto #${index + 1} debe ser un valor válido`,
        });
      }
    });
  }

  // Si hay errores, lanzar excepción
  if (errors.length > 0) {
    throw new InvoiceValidationError(errors);
  }

  return true;
};

// Validar items de factura (para uso en el formulario)
export const validateInvoiceItem = (item: InvoiceItem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.name || item.name.trim() === "") {
    errors.push("El nombre del ítem es requerido");
  }

  if (!item.description || item.description.trim() === "") {
    errors.push("La descripción del ítem es requerida");
  }

  if (item.quantity <= 0) {
    errors.push("La cantidad debe ser mayor a 0");
  }

  if (item.unitPrice < 0) {
    errors.push("El precio unitario no puede ser negativo");
  }

  if (item.discount < 0) {
    errors.push("El descuento no puede ser negativo");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utilidad para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 