import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Copy, TestTube, Save, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useToast } from "../../../components/ui/toast";

interface FormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  defaultValue?: any;
}

interface Webhook {
  id: string;
  name: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  headers: Record<string, string>;
  bodyTemplate: string;
  authentication: {
    type: "none" | "api_key" | "bearer" | "basic";
    credentials?: any;
  };
  isActive: boolean;
  timeout: number;
  retryCount: number;
}

interface Automation {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  webhooks: Webhook[];
  forms: Array<{
    name: string;
    description?: string;
    fields: FormField[];
    isActive: boolean;
  }>;
  triggers: Array<{
    type: string;
    conditions: any[];
    isActive: boolean;
    priority: number;
  }>;
  isActive: boolean;
  tags: string[];
}

interface AutomationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  automation?: Automation | null;
}

export function AutomationForm({
  isOpen,
  onClose,
  onSubmit,
  automation,
}: AutomationFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Automation>({
    name: "",
    description: "",
    category: "custom",
    webhooks: [],
    forms: [],
    triggers: [],
    isActive: true,
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);

  const toast = useToast();

  // Inicializar formulario con datos de edición
  useEffect(() => {
    if (automation) {
      setFormData(automation);
    }
  }, [automation]);

  const handleInputChange = (field: keyof Automation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddWebhook = () => {
    const newWebhook: Webhook = {
      id: Date.now().toString(),
      name: "",
      endpoint: "",
      method: "POST",
      headers: {},
      bodyTemplate: "",
      authentication: { type: "none" },
      isActive: true,
      timeout: 30000,
      retryCount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      webhooks: [...prev.webhooks, newWebhook],
    }));
    setEditingWebhook(newWebhook);
    setShowWebhookForm(true);
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setShowWebhookForm(true);
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setFormData((prev) => ({
      ...prev,
      webhooks: prev.webhooks.filter((w) => w.id !== webhookId),
    }));
  };

  const handleSaveWebhook = (webhookData: Webhook) => {
    if (editingWebhook) {
      // Actualizar webhook existente
      setFormData((prev) => ({
        ...prev,
        webhooks: prev.webhooks.map((w) =>
          w.id === editingWebhook.id ? webhookData : w
        ),
      }));
    } else {
      // Agregar nuevo webhook
      setFormData((prev) => ({
        ...prev,
        webhooks: [...prev.webhooks, webhookData],
      }));
    }
    setShowWebhookForm(false);
    setEditingWebhook(null);
  };

  const handleAddForm = () => {
    const newForm = {
      id: Date.now().toString(),
      name: "",
      description: "",
      fields: [],
      isActive: true,
    };
    setFormData((prev) => ({ ...prev, forms: [...prev.forms, newForm] }));
    setEditingForm(newForm);
    setShowFormBuilder(true);
  };

  const handleEditForm = (form: any) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };

  const handleDeleteForm = (formId: string) => {
    setFormData((prev) => ({
      ...prev,
      forms: prev.forms.filter((f) => f.id !== formId),
    }));
  };

  const handleSaveForm = (formData: any) => {
    if (editingForm) {
      // Actualizar formulario existente
      setFormData((prev) => ({
        ...prev,
        forms: prev.forms.map((f) => (f.id === editingForm.id ? formData : f)),
      }));
    } else {
      // Agregar nuevo formulario
      setFormData((prev) => ({
        ...prev,
        forms: [...prev.forms, formData],
      }));
    }
    setShowFormBuilder(false);
    setEditingForm(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.show({
        title: "Error",
        description: "El nombre de la automatización es requerido",
        type: "error",
      });
      return;
    }

    if (formData.webhooks.length === 0) {
      toast.show({
        title: "Error",
        description: "Debe agregar al menos un webhook",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: Implementar llamada a la API
      // if (automation) {
      //   await n8nService.updateAutomation(automation._id!, formData);
      // } else {
      //   await n8nService.createAutomation(formData);
      // }

      toast.show({
        title: "Éxito",
        description: automation
          ? "Automatización actualizada"
          : "Automatización creada",
        type: "success",
      });

      onSubmit();
    } catch (error) {
      console.error("Error guardando automatización:", error);
      toast.show({
        title: "Error",
        description: "No se pudo guardar la automatización",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {automation ? "Editar Automatización" : "Nueva Automatización"}
            </h2>
            <p className="text-gray-600">
              {automation
                ? "Modifica los detalles de la automatización"
                : "Crea una nueva automatización"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="forms">Formularios</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            </TabsList>

            {/* Tab: General */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Configura los detalles principales de la automatización
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ej: Crear Contacto Automático"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe qué hace esta automatización"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="crm">CRM</option>
                      <option value="email">Email</option>
                      <option value="custom">Personalizada</option>
                      <option value="lead_generation">
                        Generación de Leads
                      </option>
                      <option value="support">Soporte</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Agregar tag"
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive">Activar automáticamente</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Webhooks */}
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Webhooks</CardTitle>
                      <CardDescription>
                        Configura los endpoints que se ejecutarán
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddWebhook}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Webhook
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.webhooks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay webhooks configurados
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.webhooks.map((webhook) => (
                        <div key={webhook.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {webhook.name || "Webhook sin nombre"}
                              </h4>
                              <Badge
                                variant={
                                  webhook.isActive ? "default" : "secondary"
                                }
                              >
                                {webhook.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                              <Badge variant="outline">{webhook.method}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditWebhook(webhook)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteWebhook(webhook.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 break-all">
                            {webhook.endpoint || "Endpoint no configurado"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Formularios */}
            <TabsContent value="forms" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Formularios Personalizados</CardTitle>
                      <CardDescription>
                        Crea formularios para recopilar datos antes de ejecutar
                        la automatización
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Formulario
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.forms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay formularios configurados
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.forms.map((form) => (
                        <div key={form.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {form.name || "Formulario sin nombre"}
                              </h4>
                              <Badge
                                variant={
                                  form.isActive ? "default" : "secondary"
                                }
                              >
                                {form.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                              <Badge variant="outline">
                                {form.fields.length} campos
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditForm(form)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteForm(form.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {form.description && (
                            <p className="text-sm text-gray-600">
                              {form.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Triggers */}
            <TabsContent value="triggers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Triggers y Condiciones</CardTitle>
                  <CardDescription>
                    Define cuándo se ejecutará la automatización
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Configuración de triggers en desarrollo...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Avanzado */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Avanzada</CardTitle>
                  <CardDescription>
                    Ajustes de rendimiento y comportamiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Configuración avanzada en desarrollo...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {automation ? "Actualizar" : "Crear"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Webhook */}
      {showWebhookForm && (
        <WebhookForm
          webhook={editingWebhook}
          onSave={handleSaveWebhook}
          onClose={() => {
            setShowWebhookForm(false);
            setEditingWebhook(null);
          }}
        />
      )}

      {/* Modal de Formulario */}
      {showFormBuilder && (
        <FormBuilder
          form={editingForm}
          onSave={handleSaveForm}
          onClose={() => {
            setShowFormBuilder(false);
            setEditingForm(null);
          }}
        />
      )}
    </div>
  );
}

// Componente para configurar webhooks (simplificado por ahora)
function WebhookForm({ webhook, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Configurar Webhook</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Configuración de webhook en desarrollo...
          </p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(webhook)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}

// Componente para construir formularios (simplificado por ahora)
function FormBuilder({ form, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Constructor de Formularios</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Constructor de formularios en desarrollo...
          </p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(form)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
