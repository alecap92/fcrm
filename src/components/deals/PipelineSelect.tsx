import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { dealsService } from "../../services/dealsService";
import { useToast } from "../ui/toast";

interface Pipeline {
  _id: string;
  title: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface PipelineSelectProps {
  selectedPipelineId: string;
  onPipelineChange: (pipelineId: string) => void;
}

export function PipelineSelect({
  selectedPipelineId,
  onPipelineChange,
}: PipelineSelectProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const response = await dealsService.getPipelines();
      setPipelines(response.data || []);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los pipelines",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPipeline = pipelines.find((p) => p._id === selectedPipelineId);

  const handleChange = (value: string) => {
    // No permitir seleccionar la opción de título
    if (value !== "" && value !== "title") {
      onPipelineChange(value);
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedPipelineId || "title"}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isLoading}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[200px]"
      >
        {isLoading ? (
          <option value="">Cargando pipelines...</option>
        ) : (
          <>
            {/* Opción de título */}
            <option
              value="title"
              disabled
              className="text-gray-500 font-medium"
            >
              -- Pipeline --
            </option>

            {pipelines.length === 0 ? (
              <option value="" disabled>
                No hay pipelines disponibles
              </option>
            ) : (
              pipelines.map((pipeline) => (
                <option key={pipeline._id} value={pipeline._id}>
                  {pipeline.title}
                </option>
              ))
            )}
          </>
        )}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
