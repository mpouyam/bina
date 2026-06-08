import { act, renderHook } from "@testing-library/react";

import { useBuildSessionStore } from "@/app/craft/hooks/useBuildSessionStore";
import { useBuildStreaming } from "@/app/craft/hooks/useBuildStreaming";
import {
  processSSEStream,
  sendMessageStream,
} from "@/app/craft/services/apiServices";

jest.mock("swr", () => ({
  useSWRConfig: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/app/craft/services/apiServices", () => ({
  RateLimitError: class RateLimitError extends Error {},
  fetchScheduledRunEventStream: jest.fn(),
  fetchSession: jest.fn(),
  interruptMessageStream: jest.fn(),
  processSSEStream: jest.fn(),
  sendMessageStream: jest.fn(),
}));

const sessionId = "session-thinking";

describe("useBuildStreaming thinking packets", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useBuildSessionStore.setState({
      currentSessionId: null,
      sessions: new Map(),
    } as never);
    useBuildSessionStore.getState().createSession(sessionId, {
      status: "active",
      isLoaded: true,
    });

    jest.mocked(sendMessageStream).mockResolvedValue({} as Response);
    jest
      .mocked(processSSEStream)
      .mockImplementation(async (_response, onPacket) => {
        onPacket({
          sessionUpdate: "agent_thought_chunk",
          content: { type: "text", text: "Inspecting the app state." },
          timestamp: "2026-01-01T00:00:00Z",
        } as never);
        onPacket({
          type: "tool_call_start",
          tool_call_id: "tool-read",
          kind: "read",
          title: "Read file",
          content: null,
          locations: null,
          raw_input: null,
          raw_output: null,
          status: "pending",
          timestamp: "2026-01-01T00:00:01Z",
        });
      });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("keeps a thought visible when the next packet arrives in the same stream task", async () => {
    const { result } = renderHook(() => useBuildStreaming());

    await act(async () => {
      await result.current.streamMessage(sessionId, "build the app");
    });

    const streamItems =
      useBuildSessionStore.getState().sessions.get(sessionId)?.streamItems ??
      [];

    expect(streamItems).toHaveLength(2);
    expect(streamItems[0]).toMatchObject({
      type: "thinking",
      content: "Inspecting the app state.",
      isStreaming: true,
    });
    expect(streamItems[1]).toMatchObject({
      type: "tool_call",
      id: "tool-read",
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const settledThought = useBuildSessionStore
      .getState()
      .sessions.get(sessionId)?.streamItems[0];
    expect(settledThought).toMatchObject({
      type: "thinking",
      isStreaming: false,
    });
  });
});
