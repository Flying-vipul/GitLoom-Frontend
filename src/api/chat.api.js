/**
 * Chat API — wired to the REAL backend endpoints.
 *
 * Verified against ChatController.java + ChatService.java
 *
 * Architecture:
 *   - Sessions are SCOPED to a repository (repositoryId required)
 *   - You must pick a repository first, then create/list sessions for it
 *   - SSE stream: POST /api/chat/sessions/{id}/stream  body: { content: string }
 *
 * SSE event types emitted by ChatStreamHandler:
 *   user_message     → JSON ChatMessageResponse (persisted user message)
 *   token            → plain string (incremental LLM token)
 *   assistant_message → JSON ChatMessageResponse (final assistant message + citations)
 *   done             → empty (stream complete)
 *   error            → plain string (error message)
 *
 * CitationDto shape (from CitationDto.java):
 *   { filePath, starting, endLine, language }
 *   Note: startLine field is named "starting" in the backend record.
 */

import client from './client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Session management ────────────────────────────────────────────────────────

/**
 * Create a new chat session for a specific repository.
 * The repository MUST have indexStatus === READY.
 *
 * @param {{ repositoryId: string, title?: string }} params
 * @returns {Promise<ChatSessionResponse>}
 */
export async function createChatSession({ repositoryId, title }) {
  const { data } = await client.post('/api/chat/sessions', {
    repositoryId,
    ...(title ? { title } : {}),
  });
  return data;
}

/**
 * List all chat sessions for a specific repository.
 * Sessions are scoped per-repository on the backend.
 *
 * @param {string} repositoryId
 * @returns {Promise<ChatSessionResponse[]>}
 */
export async function listChatSessions(repositoryId) {
  const { data } = await client.get('/api/chat/sessions', {
    params: { repositoryId },
  });
  return data;
}

/**
 * Get all messages for a chat session.
 *
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<ChatMessageResponse[]>}
 */
export async function getChatMessages(sessionId) {
  const { data } = await client.get(`/api/chat/sessions/${sessionId}/messages`);
  return data;
}

// ── SSE streaming ─────────────────────────────────────────────────────────────

/**
 * Stream an AI reply via Server-Sent Events.
 *
 * Uses fetch() (not EventSource) because we need to:
 *   1. Send a POST body with { content }
 *   2. Include credentials (session cookie)
 *
 * @param {string} sessionId
 * @param {string} content - the user's message
 * @param {{
 *   onToken: (token: string) => void,
 *   onUserMessage: (msg: ChatMessageResponse) => void,
 *   onAssistantMessage: (msg: ChatMessageResponse) => void,
 *   onDone: () => void,
 *   onError: (errorText: string) => void,
 * }} handlers
 * @returns {{ abort: () => void }}
 */
export function streamChatReply(sessionId, content, handlers) {
  const { onToken, onUserMessage, onAssistantMessage, onDone, onError } = handlers;
  const controller = new AbortController();

  fetch(`${BASE_URL}/api/chat/sessions/${sessionId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
          const body = await response.json();
          msg = body.message || body.error || msg;
        } catch {
          // keep status code message
        }
        onError?.(msg);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const dispatch = (eventName, rawData) => {
        try {
          switch (eventName) {
            case 'user_message':
              onUserMessage?.(JSON.parse(rawData));
              break;
            case 'token':
              // rawData is the token string itself — may be URL-encoded or plain
              onToken?.(rawData);
              break;
            case 'assistant_message':
              onAssistantMessage?.(JSON.parse(rawData));
              break;
            case 'done':
              onDone?.();
              break;
            case 'error':
              onError?.(rawData || 'An error occurred');
              break;
            default:
              break;
          }
        } catch {
          // JSON parse error — skip silently for non-critical events
        }
      };

      const processBuffer = () => {
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = 'message';
          const dataLines = [];

          for (const line of part.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
          }

          dispatch(eventName, dataLines.join('\n'));
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            processBuffer();
            onDone?.();
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        onError?.(err.message || 'Stream interrupted');
      }
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      onError?.(err.message || 'Network error — check that the backend is running');
    });

  return { abort: () => controller.abort() };
}
