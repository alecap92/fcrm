

export const SampleInvoice = {
    number: 990001147,
    type_document_id: 1,
    date: "2024-08-31",
    time: "04:08:12",
    resolution_number: "18760000001",
    prefix: "SETP",
    notes: "",
    disable_confirmation_text: true,
    establishment_address: "Cr 17 no 118 32",
    establishment_phone: "3132925094",
    establishment_municipality: 112,
    establishment_email: "ventas@manillasdecontrol.com",
    sendmail: true,
    sendmailtome: true,
    send_customer_credentials: false,
    annexes: [],
    html_header: "<h1 style=\"color: #5e9ca0;\">Se&ntilde;or(es), XXXXXXXXXXXXXXXXXXX identificado con NIT 99999999-9</h1><h2 style=\"color: #2e6c80;\">Le informamos que ha recibido un documento electronico de: YYYYYYYYYYYYYYYYYYYYYYYYY</h2>",
    html_buttons: "<table style=\"border-collapse: collapse; width: 100%;\" border=\"1\"><tbody><tr><td style=\"width: 100%;\"><h2><strong><span style=\"color: #008080;\">Puede descargar su factura mediante el siguiente enlace:</span></strong></h2></td></tr><tr><td style=\"width: 100%;\"><h4><a href=\"https://www.facilwebnube.com/apidian2021/public/index.php/api/download/88261176/FES-FE369.pdf\" target=\"_blank\">Haga click aqui para descargar su factura.</a></h4></td></tr></tbody></table>",
    html_footer: "<table style=\"border-collapse: collapse; width: 100%;\" border=\"1\"><tbody><tr><td style=\"width: 100%;\"><h2><strong><span style=\"color: #008080;\">Previamente recibio un correo con las credenciales de ingreso a la plataforma.</span></strong></h2></td></tr><tr><td style=\"width: 100%;\"><div><h4><strong>Este es un sistema autom&aacute;tico de aviso, por favor no responda este mensaje de correo.</strong></h4></div></td></tr></tbody></table>",
    foot_note: "Allcanyoubuy SAS - NIT: 900694948-9 - Tel: 573143007263 - Email: ventas@manillasdecontrol.com",
    customer: {
      identification_number: 89008003,
      dv: 2,
      name: "INVERSIONES DAVAL SAS",
      phone: "3103891693",
      address: "CLL 4 NRO 33-90",
      email: "alexanderobandolondono@gmail.com",
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
      payment_due_date: "2024-08-31",
      duration_measure: "0"
    },
    legal_monetary_totals: {
      line_extension_amount: "840336.134",
      tax_exclusive_amount: "840336.134",
      tax_inclusive_amount: "1000000.00",
      payable_amount: "1000000.00"
    },
    tax_totals: [
      {
        tax_id: 1,
        tax_amount: "159663.865",
        percent: "19.00",
        taxable_amount: "840336.134"
      }
    ],
    invoice_lines: [
      {
        unit_measure_id: 70,
        invoiced_quantity: "1",
        line_extension_amount: "840336.134",
        free_of_charge_indicator: false,
        tax_totals: [
          {
            tax_id: 1,
            tax_amount: "159663.865",
            taxable_amount: "840336.134",
            percent: "19.00"
          }
        ],
        description: "COMISION POR SERVICIOS",
        notes: "ESTA ES UNA PRUEBA DE NOTA DE DETALLE DE LINEA.",
        code: "COMISION",
        type_item_identification_id: 4,
        price_amount: "1000000.00",
        base_quantity: "1"
      }
    ]
  }
  