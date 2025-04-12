export interface NotaCredito {
  number: number;
  type_document_id: number;
  date: string;
  time: string;
  resolution_number: string;
  prefix: string;
  notes: string;
  disable_confirmation_text: boolean;
  establishment_address: string;
  establishment_phone: string;
  establishment_municipality: number;
  establishment_email: string;
  sendmail: boolean;
  sendmailtome: boolean;
  send_customer_credentials: boolean;
  annexes: any[];
  html_header: string;
  html_buttons: string;
  html_footer: string;
  head_note: string;
  foot_note: string;
  customer: {
    identification_number: number;
    dv: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    merchant_registration: string;
    type_document_identification_id: number;
    type_organization_id: number;
    type_liability_id: number;
    municipality_id: number;
    type_regime_id: number;
  };
  payment_form: {
    payment_form_id: number;
    payment_method_id: number;
    payment_due_date: string;
    duration_measure: string;
  };
  legal_monetary_totals: {
    line_extension_amount: string;
    tax_exclusive_amount: string;
    tax_inclusive_amount: string;
    allowance_total_amount: string;
    payable_amount: string;
  };
  tax_totals: Array<{
    tax_id: number;
    tax_amount: string;
    percent: string;
    taxable_amount: string;
  }>;
  invoice_lines: Array<{
    unit_measure_id: number;
    invoiced_quantity: string;
    line_extension_amount: string;
    free_of_charge_indicator: boolean;
    allowance_charges?: Array<{
      charge_indicator: boolean;
      allowance_charge_reason: string;
      amount: string;
      base_amount: string;
    }>;
    tax_totals: Array<{
      tax_id: number;
      tax_amount: string;
      taxable_amount: string;
      percent: string;
    }>;
    description: string;
    notes: string;
    code: string;
    type_item_identification_id: number;
    price_amount: string;
    base_quantity: string;
  }>;
  reference_invoice: {
    number: string;
    date: string;
    type_document_id: number;
  };
  reason_code: string;
  reason_description: string;
}

export const SampleNotaCredito: Partial<NotaCredito> = {
  number: 1,
  type_document_id: 2, // 2 es el código para notas de crédito
  date: "2024-03-20",
  time: "10:00:00",
  resolution_number: "123456",
  prefix: "NC",
  notes: "Nota de crédito de ejemplo",
  disable_confirmation_text: true,
  establishment_address: "Calle 123",
  establishment_phone: "1234567890",
  establishment_municipality: 600,
  establishment_email: "empresa@ejemplo.com",
  sendmail: true,
  sendmailtome: true,
  send_customer_credentials: false,
  annexes: [],
  html_header: "",
  html_buttons: "",
  html_footer: "",
  head_note: "",
  foot_note: "",
  customer: {
    identification_number: 123456789,
    dv: "0",
    name: "Cliente Ejemplo",
    phone: "1234567890",
    address: "Calle Cliente 123",
    email: "cliente@ejemplo.com",
    merchant_registration: "0000000-00",
    type_document_identification_id: 6,
    type_organization_id: 1,
    type_liability_id: 7,
    municipality_id: 822,
    type_regime_id: 1
  },
  payment_form: {
    payment_form_id: 2,
    payment_method_id: 30,
    payment_due_date: "2024-04-20",
    duration_measure: "0"
  },
  legal_monetary_totals: {
    line_extension_amount: "100000.00",
    tax_exclusive_amount: "100000.00",
    tax_inclusive_amount: "119000.00",
    allowance_total_amount: "0.00",
    payable_amount: "119000.00"
  },
  tax_totals: [{
    tax_id: 1,
    tax_amount: "19000.00",
    percent: "19",
    taxable_amount: "100000.00"
  }],
  invoice_lines: [{
    unit_measure_id: 70,
    invoiced_quantity: "1",
    line_extension_amount: "100000.00",
    free_of_charge_indicator: false,
    tax_totals: [{
      tax_id: 1,
      tax_amount: "19000.00",
      taxable_amount: "100000.00",
      percent: "19"
    }],
    description: "Producto de ejemplo",
    notes: "",
    code: "PROD001",
    type_item_identification_id: 4,
    price_amount: "100000.00",
    base_quantity: "1"
  }],
  reference_invoice: {
    number: "FAC-001",
    date: "2024-03-19",
    type_document_id: 1
  },
  reason_code: "01",
  reason_description: "Devolución de producto"
}; 