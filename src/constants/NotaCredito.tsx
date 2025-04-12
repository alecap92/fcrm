export const SampleNotaCredito = {
	"billing_reference": {
		"number": "FS20",
		"uuid": "ed8de5a83b7619c66eb19f4cced0e7bfff3ac1ffad12610efff125927e1efdbc5d0c7056480fc3e0a0d44fd1331bfbc6",
		"issue_date": "2025-04-10"
	},
	"discrepancyresponsecode": 2,
	"discrepancyresponsedescription": "PRUEBA DE MOTIVO NOTA CREDITO",
    "notes": "PRUEBA DE NOTA CREDITO",
    "resolution_number": "0000000000",
    "prefix": "NC",
	"number": 73,
	"type_document_id": 4,
	"date": "2025-04-10",
	"time": "10:15:37",
    "establishment_name": "TORRE SOFTWARE",
    "establishment_address": "BRR LIMONAR MZ 6 CS 3 ET 1 PISO 2",
    "establishment_phone": "3226563672",
    "establishment_municipality": 600,
    "sendmail": true,
    "sendmailtome": true,
    "seze": "2021-2017",
    "head_note": "PRUEBA DE TEXTO LIBRE QUE DEBE POSICIONARSE EN EL ENCABEZADO DE PAGINA DE LA REPRESENTACION GRAFICA DE LA FACTURA ELECTRONICA VALIDACION PREVIA DIAN",
    "foot_note": "PRUEBA DE TEXTO LIBRE QUE DEBE POSICIONARSE EN EL ENCABEZADO DE PAGINA DE LA REPRESENTACION GRAFICA DE LA FACTURA ELECTRONICA VALIDACION PREVIA DIAN",
	"customer": {
		"identification_number": 1020776180,
		"dv": 1,
		"name": "INVERSIONES DAVAL SAS",
		"phone": "3103891693",
		"address": "CLL 4 NRO 33-90",
		"email": "alexanderobandolondono@gmail.com",
		"merchant_registration": "0000000-00",
		"type_document_identification_id": 6,
		"type_organization_id": 1,
		"municipality_id": 822,
		"type_regime_id": 1
	},
	"legal_monetary_totals": {
		"line_extension_amount": "769500.00",
		"tax_exclusive_amount": "950000.00",
		"tax_inclusive_amount": "950000.00",
		"payable_amount": "950000.00"
	},
	"tax_totals": 
	[
		{
			"tax_id": 1,
			"tax_amount": "180500",
			"percent": "19",
			"taxable_amount": "950000.00"
		}
	],
	"credit_note_lines": 
	[
		{
			"unit_measure_id": 70,
			"invoiced_quantity": "1",
			"line_extension_amount": "769500.00",
			"free_of_charge_indicator": false,
			"allowance_charges": [{
					"charge_indicator": false,
					"allowance_charge_reason": "DESCUENTO GENERAL",
					"amount": "50000.00",
					"base_amount": "1000000.00"
				}
			],
			"tax_totals": [
				{
					"tax_id": 1,
					"tax_amount": "180500",
					"taxable_amount": "950000",
					"percent": "19.00"
				}
			],
			"description": "COMISION POR SERVICIOS",
            "notes": "ESTA ES UNA PRUEBA DE NOTA DE DETALLE DE LINEA.",
			"code": "COMISION",
			"type_item_identification_id": 4,
			"price_amount": "1000000.00",
			"base_quantity": "1"
		}
	]
}
