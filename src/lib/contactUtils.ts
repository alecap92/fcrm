/**
 * Utilidades para el manejo de contactos
 */

export interface CustomerAttribute {
  id: string;
  label: string;
  value: string;
}

/**
 * Convierte los datos de un contacto en atributos para mostrar
 */
export const contactToAttributes = (
  contact: any,
  conversationTitle?: string
): CustomerAttribute[] => {
  const attributes: CustomerAttribute[] = [];

  // Nombre
  const fullName =
    contact?.firstName && contact?.lastName
      ? `${contact.firstName} ${contact.lastName}`
      : conversationTitle || "";

  if (fullName) {
    attributes.push({
      id: "title",
      label: "Nombre",
      value: fullName,
    });
  }

  // Teléfono
  if (contact?.phone) {
    attributes.push({
      id: "mobile",
      label: "Celular",
      value: contact.phone,
    });
  }

  // Empresa
  if (contact?.companyName) {
    attributes.push({
      id: "companyName",
      label: "Nombre de la empresa",
      value: contact.companyName,
    });
  }

  // Dirección
  if (contact?.address) {
    const addressValue =
      typeof contact.address === "object"
        ? `${contact.address.street || ""}`.replace(/^[, ]+|[, ]+$/, "")
        : contact.address;

    if (addressValue) {
      attributes.push({
        id: "address",
        label: "Dirección",
        value: addressValue,
      });
    }
  }

  // Ciudad
  if (contact?.city) {
    const cityValue =
      typeof contact.city === "object"
        ? JSON.stringify(contact.city)
        : contact.city;

    if (cityValue) {
      attributes.push({
        id: "city",
        label: "Ciudad",
        value: cityValue,
      });
    }
  }

  // Departamento/Estado
  if (contact?.state) {
    const stateValue =
      typeof contact.state === "object"
        ? JSON.stringify(contact.state)
        : contact.state;

    if (stateValue) {
      attributes.push({
        id: "state",
        label: "Departamento",
        value: stateValue,
      });
    }
  }

  // Email
  if (contact?.email) {
    attributes.push({
      id: "email",
      label: "Email",
      value: contact.email,
    });
  }

  return attributes;
};

/**
 * Verifica si un contacto tiene información básica
 */
export const hasBasicContactInfo = (contact: any): boolean => {
  return !!(
    contact?.firstName ||
    contact?.lastName ||
    contact?.phone ||
    contact?.email
  );
};

/**
 * Obtiene el nombre completo de un contacto
 */
export const getContactFullName = (contact: any): string => {
  if (!contact) return "";

  const firstName = contact.firstName || "";
  const lastName = contact.lastName || "";

  return `${firstName} ${lastName}`.trim();
};

/**
 * Formatea una dirección de contacto
 */
export const formatContactAddress = (address: any): string => {
  if (!address) return "";

  if (typeof address === "string") return address;

  if (typeof address === "object") {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  return "";
};
