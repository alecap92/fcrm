import axios from "axios";

interface FormuAppApi {
  formId: string;
  content: {};
}

const getPDFFile = async (
  formId: string,
  content: FormuAppApi["content"],
  apiKey: string
) => {
  const apiURL = `https://formuapi2.alecap922.site/api/files/pdf/${formId}`;

  const response = await axios.post(apiURL, content, {
    headers: {
      "x-api-key": apiKey,
    },
    responseType: "blob", // Esto asegura que el PDF se maneje correctamente como un archivo
  });

  return response.data; // Devuelve solo el blob del PDF
};

const getFile = async (formId: string, apiKey: string) => {
  const response = await axios.get(
    "https://formuapi2.alecap922.site/api/files/" + formId,
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  return response.data;
};

const getTemplates = async (apiKey: string) => {
  const response = await axios.get(
    "https://formuapi2.alecap922.site/api/files/",
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  return response.data;
};

const formuAppService = {
  getPDFFile,
  getFile,
  getTemplates,
};
export default formuAppService;
