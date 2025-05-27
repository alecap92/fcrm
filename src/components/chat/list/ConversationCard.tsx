import React from "react";

interface ConversationCardProps {
  title: string;
  lastMessage: string;
  priority: string;
  createdAt: string;
  assignedTo: string;
  tags: string[];
  isRead: boolean;
  onDelete?: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  title,
  lastMessage,
  priority,
  createdAt,
  assignedTo,
  tags,
  isRead,
  onDelete,
}) => {
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
      className="hover:border-2 hover:border-gray-300"
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
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: "20px",
            color: "#aaa",
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
          &times;
        </button>
      )}
    </div>
  );
};

export default ConversationCard;
