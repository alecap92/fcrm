import axios from "axios";

const sendEmail = async (form: {
  to: string[];
  subject: string;
  content: string;
  attachments?: File[];
}) => {
  try {
    const formData = new FormData();

    // Agregar campos básicos
    formData.append("to", JSON.stringify(form.to));
    formData.append("subject", form.subject);
    formData.append("content", form.content);

    // Agregar archivos adjuntos si existen
    if (form.attachments && form.attachments.length > 0) {
      form.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/email/send`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error, " error");
    throw error;
  }
};

const emailsService = {
  sendEmail,
};

export default emailsService;
