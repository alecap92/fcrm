import { ChevronRight } from 'lucide-react';
import { Modal } from '../ui/modal';
import fragmentsService from '../../services/fragmentsService';
import { useEffect, useState } from 'react';

interface QuickResponse {
  id: string;
  title: string;
  content: string;
}

interface QuickResponsesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;

}

export function QuickResponses({ isOpen, onClose, onSelect }: QuickResponsesProps) {

const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([]);
const loadQuickResponses = async () => {
    const response:any = await fragmentsService.getFragments();
    console.log(response.data.fragments,1);
    setQuickResponses(response.data.fragments)
}

useEffect(() => {
    loadQuickResponses();
}, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Respuestas rápidas"
    >
      <div className="space-y-2">
        {quickResponses.map((response:any) => (
          <button
            key={response.id}
            className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex items-center justify-between"
            onClick={() => onSelect(response.text)}
          >
            <div>
              <h4 className="font-medium text-gray-900">{response.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">{response.text}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </Modal>
  );
} 