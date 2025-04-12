import axios from "axios";
import { ConfigCompany, ConfigSoftware } from "../types/invoiceConfiguration";
import { apiService } from "../config/apiConfig";

/*

1. Config Company que responde el token.
2. Config Software


*/

const apiDianBaseUrl = import.meta.env.VITE_API_DIAN;

const configCompany = async (form: ConfigCompany) => {
  try {
    const response = await axios.post(
      `${apiDianBaseUrl}/ubl2.1/config/${form.id_number}/${form.verification_number}`,
      form
    );

    // almacenar el token en localStorage
    localStorage.setItem("ApiDian_token", response.data.token);

    return response.data;
  } catch (error) {
    console.error("Error in configCompany: ", error);
    throw new Error("Error in configCompany");
  }
};

const configSoftware = async (form: ConfigSoftware) => {
  try {
    const token = localStorage.getItem("ApiDian_token");
    console.log(token);
    if (!token) {
      throw new Error("Token not found");
    }

    const response = await axios.put(
      `${apiDianBaseUrl}/ubl2.1/config/software`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response);

    return response.data;
  } catch (error) {
    console.error("Error in configSoftware: ", error);
    throw error;
  }
};

const configCertificate = async (formData: any) => {
  try {
    const token = localStorage.getItem("ApiDian_token");
    if (!token) {
      throw new Error("Token not found");
    }

    formData.append("token", token);

    const response = axios.post(
      import.meta.env.VITE_API_BASE_URL +
        "/invoice-configuration/parseCertificate",
      formData
    );

    return response;
  } catch (error) {
    console.error("Error in configCertificate: ", error);
    throw error;
  }
};

const configResolution = async (formData: any) => {
  try {
    const token = localStorage.getItem("ApiDian_token");
    if (!token) {
      throw new Error("Token not found");
    }

    const response = axios.post(
      import.meta.env.VITE_API_BASE_URL +
        "/invoice-configuration/configResolution",
      { ...formData, token: token }
    );

    return response;
  } catch (error) {
    console.error("Error in configResolution: ", error);
    throw error;
  }
};

const testInvoice = async (formData: any) => {
  try {
    const token = localStorage.getItem("ApiDian_token");
    if (!token) {
      throw new Error("Token not found");
    }
    const response = axios.post(
      import.meta.env.VITE_API_BASE_URL + "/invoice-configuration/testInvoice",
      { ...formData, token: token }
    );

    return response;
  } catch (error) {
    console.error("Error in testInvoice: ", error);
    throw error;
  }
};

const invoiceConfigurationService = {
  configCompany,
  configSoftware,
  configCertificate,
  configResolution,
  testInvoice,
};

export default invoiceConfigurationService;
