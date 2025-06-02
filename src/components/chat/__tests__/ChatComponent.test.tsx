import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "../../../tests/utils/test-utils";
import { vi } from "vitest";
import ChatComponent from "../ChatComponent";

// Mock del hook useChat
const mockUseChat = vi.fn();
vi.mock("../../../hooks/useChat", () => ({
  useChat: mockUseChat,
}));

describe("ChatComponent", () => {
  const defaultProps = {
    conversationId: "conv-1",
    onMessageSent: vi.fn(),
  };

  const mockChatData = {
    messages: [
      {
        id: "1",
        content: "Hola, ¿cómo estás?",
        sender: "contact",
        timestamp: "2024-01-01T10:00:00.000Z",
      },
      {
        id: "2",
        content: "¡Hola! Muy bien, gracias.",
        sender: "agent",
        timestamp: "2024-01-01T10:01:00.000Z",
      },
    ],
    isLoading: false,
    sendMessage: vi.fn(),
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChat.mockReturnValue(mockChatData);
  });

  it("should render chat messages correctly", () => {
    render(<ChatComponent {...defaultProps} />);

    expect(screen.getByText("Hola, ¿cómo estás?")).toBeInTheDocument();
    expect(screen.getByText("¡Hola! Muy bien, gracias.")).toBeInTheDocument();
  });

  it("should render message input field", () => {
    render(<ChatComponent {...defaultProps} />);

    const input = screen.getByPlaceholderText("Escribe un mensaje...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("should render send button", () => {
    render(<ChatComponent {...defaultProps} />);

    const sendButton = screen.getByRole("button", { name: /enviar/i });
    expect(sendButton).toBeInTheDocument();
  });

  it("should call sendMessage when form is submitted with valid text", async () => {
    render(<ChatComponent {...defaultProps} />);

    const input = screen.getByPlaceholderText("Escribe un mensaje...");
    const sendButton = screen.getByRole("button", { name: /enviar/i });

    // Escribir mensaje
    fireEvent.change(input, { target: { value: "Nuevo mensaje de prueba" } });

    // Enviar mensaje
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockChatData.sendMessage).toHaveBeenCalledWith(
        "Nuevo mensaje de prueba"
      );
    });
  });

  it("should not call sendMessage when input is empty", () => {
    render(<ChatComponent {...defaultProps} />);

    const sendButton = screen.getByRole("button", { name: /enviar/i });

    // Intentar enviar sin texto
    fireEvent.click(sendButton);

    expect(mockChatData.sendMessage).not.toHaveBeenCalled();
  });

  it("should clear input after sending message", async () => {
    render(<ChatComponent {...defaultProps} />);

    const input = screen.getByPlaceholderText(
      "Escribe un mensaje..."
    ) as HTMLInputElement;
    const sendButton = screen.getByRole("button", { name: /enviar/i });

    // Escribir y enviar mensaje
    fireEvent.change(input, { target: { value: "Mensaje de prueba" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("should disable send button when loading", () => {
    mockUseChat.mockReturnValue({
      ...mockChatData,
      isLoading: true,
    });

    render(<ChatComponent {...defaultProps} />);

    const sendButton = screen.getByRole("button", { name: /enviar/i });
    expect(sendButton).toBeDisabled();
  });

  it("should display error message when there is an error", () => {
    const errorMessage = "Error al enviar mensaje";
    mockUseChat.mockReturnValue({
      ...mockChatData,
      error: errorMessage,
    });

    render(<ChatComponent {...defaultProps} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should handle Enter key press to send message", async () => {
    render(<ChatComponent {...defaultProps} />);

    const input = screen.getByPlaceholderText("Escribe un mensaje...");

    // Escribir mensaje
    fireEvent.change(input, { target: { value: "Mensaje con Enter" } });

    // Presionar Enter
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockChatData.sendMessage).toHaveBeenCalledWith(
        "Mensaje con Enter"
      );
    });
  });

  it("should not send message on Shift+Enter", () => {
    render(<ChatComponent {...defaultProps} />);

    const input = screen.getByPlaceholderText("Escribe un mensaje...");

    // Escribir mensaje
    fireEvent.change(input, { target: { value: "Mensaje con Shift+Enter" } });

    // Presionar Shift+Enter
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

    expect(mockChatData.sendMessage).not.toHaveBeenCalled();
  });

  it("should scroll to bottom when new message is added", async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(<ChatComponent {...defaultProps} />);

    // Agregar nuevo mensaje
    const updatedMessages = [
      ...mockChatData.messages,
      {
        id: "3",
        content: "Nuevo mensaje",
        sender: "agent",
        timestamp: "2024-01-01T10:02:00.000Z",
      },
    ];

    mockUseChat.mockReturnValue({
      ...mockChatData,
      messages: updatedMessages,
    });

    rerender(<ChatComponent {...defaultProps} />);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });
});
