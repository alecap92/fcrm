import { apiService } from "../config/apiConfig";

const createNotaCredito = async (notaCredito: any) => {
try{
    const response:any = await apiService.post('/notas-credito', notaCredito);
    return response.data;
} catch (error) {
    console.error('Error al crear la nota de crédito:', error);
    throw error;
}
}



const notaCreditoService = {
    createNotaCredito
}

export default notaCreditoService;