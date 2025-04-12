import { useState } from 'react';
import { NotaCredito } from '../types/notaCredito';
import notaCreditoService from '../services/notaCreditoService';

export const useNotasCredito = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotaCredito = async (notaCredito: Omit<NotaCredito, 'billing_reference' | 'number' | 'type_document_id' | 'time' | 'establishment_name' | 'establishment_address' | 'establishment_phone' | 'establishment_municipality' | 'sendmail' | 'sendmailtome' | 'seze' | 'head_note' | 'foot_note'>) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creando nota de crédito:', notaCredito);

      const response = await notaCreditoService.createNotaCredito(notaCredito);
      console.log(response)

      return { success: true };
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Error al crear la nota de crédito');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createNotaCredito,
    isLoading,
    error
  };
}; 