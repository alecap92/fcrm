import {
  Smile,
  Paperclip,
  Send,
  Workflow,
  ScrollText,
  Lightbulb,
  Brain,
  LucideIcon,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface MessageInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onAttachment: () => void;
  onQuickResponse: () => void;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  title,
  onClick,
}) => {
  return (
    <Tooltip content={title}>
      <button
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors"
        onClick={onClick}
        type="button"
      >
        <Icon className="w-5 h-5 text-gray-500" />
      </button>
    </Tooltip>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-action text-white hover:bg-action-hover";
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "outline":
        return "border border-input hover:bg-accent hover:text-accent-foreground";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      case "ghost":
        return "hover:bg-accent hover:text-accent-foreground";
      case "link":
        return "underline-offset-4 hover:underline text-action";
      default:
        return "bg-action text-white hover:bg-action-hover";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "default":
        return "h-10 py-2 px-4";
      case "sm":
        return "h-9 px-3";
      case "lg":
        return "h-11 px-8";
      case "icon":
        return "h-10 w-10";
      default:
        return "h-10 py-2 px-4";
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const combinedClasses = `${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${
    className || ""
  }`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export function MessageInput({
  message,
  onMessageChange,
  onSend,
  onAttachment,
  onQuickResponse,
}: MessageInputProps) {
  const actionButtons: ActionButtonProps[] = [
    { icon: Paperclip, title: "Adjuntos", onClick: onAttachment },
    {
      icon: Lightbulb,
      title: "Respuestas predefinidas",
      onClick: onQuickResponse,
    },
    { icon: Workflow, title: "Secuencias", onClick: onQuickResponse },
    { icon: ScrollText, title: "Plantillas", onClick: onQuickResponse },
    { icon: Brain, title: "ChatGPT", onClick: onQuickResponse },
  ];

  return (
    <div className="bg-white border-t p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
          {actionButtons.map((button, index) => (
            <ActionButton
              key={index}
              icon={button.icon}
              title={button.title}
              onClick={button.onClick}
            />
          ))}
        </div>
        <div className="relative">
          <textarea
            placeholder="Escribe un mensaje t"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent resize-none"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={3}
            style={{ minHeight: "60px", maxHeight: "120px" }}
          />
          <Button
            className="absolute right-2 bottom-2 rounded-full w-8 h-8 p-0 bg-action hover:bg-action-hover"
            onClick={onSend}
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-2 text-xs text-gray-500">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </div>
      </div>
    </div>
  );
}
