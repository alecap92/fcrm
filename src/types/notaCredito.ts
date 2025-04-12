export type NotaCreditoItem = {
  id: string;
  description: string;
  price_amount: string;
  invoiced_quantity: string;
  notes: string;
  code: string;
  type_item_identification_id: number;
  createdAt: string;
  updatedAt: string;
  line_extension_amount?: string;
};

export type NotaCredito = {
    billing_reference: {
      number: string;
      uuid: string;
      issue_date: string;
    };
    discrepancyresponsecode: number;
    discrepancyresponsedescription: string;
    notes: string;
    resolution_number: string;
    prefix: string;
    number: number;
    type_document_id: number;
    date: string;
    time: string;
    establishment_name: string;
    establishment_address: string;
    establishment_phone: string;
    establishment_municipality: number;
    sendmail: boolean;
    sendmailtome: boolean;
    seze: string;
    head_note: string;
    foot_note: string;
    customer: {
      identification_number: number;
      dv: number;
      name: string;
      phone: string;
      address: string;
      email: string;
      merchant_registration: string;
      type_document_identification_id: number;
      type_organization_id: number;
      municipality_id: number;
      type_regime_id: number;
    };
    legal_monetary_totals: {
      line_extension_amount: string;
      tax_exclusive_amount: string;
      tax_inclusive_amount: string;
      payable_amount: string;
    };
    tax_totals: Array<{
      tax_id: number;
      tax_amount: string;
      percent: string;
      taxable_amount: string;
    }>;
    credit_note_lines: Array<{
      unit_measure_id: number;
      invoiced_quantity: string;
      line_extension_amount: string;
      free_of_charge_indicator: boolean;
      allowance_charges: Array<{
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
  };