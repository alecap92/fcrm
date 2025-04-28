import React from "react";

interface AiCommentsProps {
  comments: string;
}

const AiComments: React.FC<AiCommentsProps> = ({ comments }) => {
  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto">
      <div
        className="text-sm text-gray-500"
        dangerouslySetInnerHTML={{ __html: comments }}
      />
    </div>
  );
};

export default AiComments;
