import { Contact } from "../types/contact";

export const normalizeContact = (rawContact: any): Contact => {
  const propertyMap = rawContact.properties.reduce((acc: any, prop: any) => {
    acc[prop.key] = prop.value;
    return acc;
  }, {});

  return {
    _id: rawContact._id,
    organizationId: rawContact.organizationId,
    createdAt: rawContact.createdAt,
    updatedAt: rawContact.updatedAt,
    tags: rawContact.tags || ["vip"],
    firstName: propertyMap.firstName || "Sin nombre",
    lastName: propertyMap.lastName || "",
    phone: propertyMap.phone || "Sin número",
    mobile: propertyMap.mobile || "Sin número",
    city: propertyMap.city || "Sin ciudad",
    companyName: propertyMap.companyName || "Sin empresa",
    companyType: propertyMap.companyType || "Sin tipo de empresa",
    idNumber: propertyMap.idNumber || "",
    email: propertyMap.email || "", // si lo tienes en algún momento
    address: {
      street: propertyMap.address || "",
      city: propertyMap.city || "",
      state: propertyMap.state || "",
      country: propertyMap.country || "",
    },
    taxId: propertyMap.idNumber || "",
    position: propertyMap.position || "",
    website: propertyMap.website || "",
    dv: propertyMap.dv || "",
    idType: propertyMap.idType || "",
    notas: propertyMap.notas || "",
    lifeCycle: propertyMap.lifeCycle || "",
    totalRevenue: rawContact.totalRevenue || 0,
  };
};
