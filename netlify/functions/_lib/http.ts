/**
 * The edge proxy in front of Netlify kills a connection after ~30s of silence
 * ("Inactivity Timeout"), well before Netlify's own 60s function limit and
 * well within how long a real Claude analysis can take. A classic
 * { statusCode, body } handler sends zero bytes until the whole response is
 * ready, so any slow call trips it. This streams a space every few seconds
 * while waiting, then the real JSON as the final chunk — leading whitespace
 * before a JSON value is valid and JSON.parse ignores it.
 *
 * Because the HTTP status must be committed before the async work finishes,
 * success and failure are both delivered as 200 with a JSON body; failures
 * use a `{ error: string }` envelope that the client checks for explicitly.
 */
export function streamJson(compute: () => Promise<unknown>): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(" "));
      }, 8_000);

      try {
        const body = await compute();
        controller.enqueue(encoder.encode(JSON.stringify(body)));
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Не удалось получить ответ от модели. Попробуй ещё раз.";
        controller.enqueue(encoder.encode(JSON.stringify({ error: message })));
      } finally {
        clearInterval(keepAlive);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
