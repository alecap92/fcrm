import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Modal } from "../../ui/modal";
import { useDebouncer } from "../../../hooks/useDebbouncer";

const SearchModal = ({
  isOpen,
  onClose,
  onSubmit,
  searchResults,
  handleChatClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (searchTerm: string) => void;
  searchResults: any;
  handleChatClick: (chat: any) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebouncer(searchTerm, 500);

  const handleSearchSubmit = () => {
    onSubmit(debouncedSearchTerm);
  };

  console.log(searchResults);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar">
      <div>
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Ingresa un término de búsqueda"
          />
          <Button onClick={() => handleSearchSubmit()}>Buscar</Button>
        </div>
        <div className="my-4">
          {searchResults?.map((result: any) => (
            <div
              key={result._id}
              className="bg-gray-100 p-4 rounded-lg my-2 hover:border hover:border-gray-300 cursor-pointer"
              onClick={() => handleChatClick(result)}
            >
              <h3 className="text-lg font-semibold">
                {result?.possibleName}{" "}
                <span className="text-sm text-gray-500">({result.from})</span>
              </h3>
              <p className="text-sm text-gray-500">{result?.message}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
