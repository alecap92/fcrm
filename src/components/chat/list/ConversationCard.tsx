import React, { useState, MouseEvent, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import { useChatContext } from "../../../contexts/ChatContext";

interface ConversationCardProps {
  title: string;
  lastMessage: string;
  lastMessageDate: string;
  lastMessageDirection: string;
  priority: string;
  createdAt: string;
  assignedTo: string;
  tags: string[];
  isRead: boolean;
  onDelete?: () => void;
  onToggleRead?: () => void;
  onMoveTo?: (columnId: string) => void;
  status: string;
  currentStage: any;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  title,
  lastMessage,
  lastMessageDate,
  lastMessageDirection,
  priority,
  createdAt,
  assignedTo,
  tags,
  isRead,
  onDelete,
  onToggleRead,
  onMoveTo,
  status,
  currentStage,
}) => {
  const { columns } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const handleMenuToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
    if (showMenu) setShowMoveMenu(false);
  };

  const handleToggleReadClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleRead?.();
    setShowMenu(false);
    setShowMoveMenu(false);
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
    setShowMenu(false);
    setShowMoveMenu(false);
  };

  const handleMoveClick = (e: MouseEvent, columnId: string) => {
    e.stopPropagation();
    onMoveTo?.(columnId);
    setShowMenu(false);
    setShowMoveMenu(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#e53935";
      case "medium":
        return "#ffd600";
      case "low":
        return "#43a047";
      default:
        return "#e53935";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // TODO: Create a function to check if the conversation is unattended for more than 10 minutes and highlight the border of the card
  const isUnattended = useMemo(() => {
    // if (
    //   currentStage === 0 ||
    //   (currentStage === 1 && lastMessageDirection === "incoming")
    // ) {
    //   const date = new Date(lastMessageDate);
    //   const now = new Date();
    //   const diff = now.getTime() - date.getTime();
    //   return diff > 10 * 60 * 1000;
    // }
  }, []);

  return (
    <div
      style={{
        background: "#f7f7f7",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "16px",
        width: "100%",
        position: "relative",
        fontFamily: "inherit",
      }}
      className={`hover:border-2 hover:border-gray-300 ${
        isUnattended ? "border-2 border-red-500" : ""
      }`}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isRead && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: "#D1345B",
                borderRadius: "50%",
                marginRight: 5,
              }}
            />
          )}
        </div>
        <span
          style={{
            fontWeight: isRead ? 600 : 700,
            fontSize: "16px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 40px)",
            color: isRead ? "inherit" : "#000",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          color: "#666",
          fontSize: "14px",
          marginBottom: 12,
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxHeight: "2.8em",
        }}
      >
        {lastMessage}
      </div>
      <div style={{ marginBottom: 12 }}>
        {tags.map((tag) => (
          <button
            key={tag}
            style={{
              background: "#e3eeff",
              color: "#338bff",
              border: "none",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: "14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              marginRight: 4,
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "14px" }}>📅</span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {formatDate(createdAt)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "14px" }}>👤</span>
          <span
            style={{
              fontSize: "14px",
              color: "#666",
              maxWidth: "120px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {assignedTo}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: getPriorityColor(priority),
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "14px", color: "#666" }}>
            {priority === "high"
              ? "Alta"
              : priority === "medium"
              ? "Media"
              : "Baja"}
          </span>
        </div>
      </div>
      <div
        className="absolute top-3 right-3"
        style={{ position: "absolute", zIndex: 50 }}
      >
        <button
          onClick={handleMenuToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100"
            style={{ zIndex: 50 }}
          >
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleToggleReadClick}
              >
                {isRead ? "Marcar como no leída" : "Marcar como leída"}
              </button>
              {onDelete && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleDeleteClick}
                >
                  Eliminar conversación
                </button>
              )}

              <div className="relative">
                <button
                  className="w-full flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu((prev) => !prev);
                  }}
                >
                  Mover a<span className="ml-auto">▸</span>
                </button>

                {showMoveMenu && (
                  <div
                    className="absolute left-full top-0 ml-1 w-48 bg-white rounded-md shadow-lg border border-gray-100"
                    style={{ zIndex: 51 }}
                  >
                    {columns?.map((col) => (
                      <button
                        key={col.id}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => handleMoveClick(e, col.id)}
                      >
                        {col.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationCard;
