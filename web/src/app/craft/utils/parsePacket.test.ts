import { parsePacket } from "@/app/craft/utils/parsePacket";

describe("parsePacket", () => {
  it("parses raw opencode thought chunks that carry the event type in sessionUpdate", () => {
    expect(
      parsePacket({
        sessionUpdate: "agent_thought_chunk",
        content: { type: "text", text: "Inspecting the app state." },
      })
    ).toEqual({
      type: "thinking_chunk",
      text: "Inspecting the app state.",
    });
  });
});
