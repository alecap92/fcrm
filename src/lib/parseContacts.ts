import { Contact } from "../types/contact";

export const normalizeContact = (rawContact: any): Contact => {
  const propertyMap = rawContact.properties.reduce((acc: any, prop: any) => {
    acc[prop.key] = prop.value;
    return acc;
  }, {});

  return {
    id: rawContact._id,
    organizationId: rawContact.organizationId,
    createdAt: rawContact.createdAt,
    updatedAt: rawContact.updatedAt,
    tags: rawContact.tags || ["vip"],
    firstName: propertyMap.firstName || "Sin nombre",
    phone: propertyMap.mobile || "Sin número",
    city: propertyMap.city || "Sin ciudad",
    company: propertyMap.companyName || "Sin empresa",
    email: propertyMap.email || "", // si lo tienes en algún momento
    address: {
      street: "",
      city: propertyMap.city || "",
      state: "",
      country: "",
    },
  };
};
