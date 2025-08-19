import { describe, it, expect, vi } from "vitest";
import { conversationService } from "@/services/conversationService";
import { apiService } from "@/config/apiConfig";

describe("conversationService", () => {
  it("getConversationById should forward params as query string", async () => {
    const data = { id: "123" };
    const spy = vi.spyOn(apiService, "get").mockResolvedValue({ data } as any);

    const result = await conversationService.getConversationById("123", {
      page: 2,
      limit: 5,
    });

    expect(spy).toHaveBeenCalledWith("/conversation/123?page=2&limit=5");
    expect(result).toEqual(data);

    spy.mockRestore();
  });

  it("searchConversations should call the correct endpoint", async () => {
    const list = [{ id: "1" }];
    const spy = vi.spyOn(apiService, "get").mockResolvedValue({ data: list } as any);

    const result = await conversationService.searchConversations("hello");

    expect(spy).toHaveBeenCalledWith("/conversation/search?query=hello");
    expect(result).toEqual(list);

    spy.mockRestore();
  });
});
