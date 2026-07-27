/**
 * The proxy in front of Netlify closes any connection that goes ~30s without
 * receiving bytes ("Inactivity Timeout"). Analyzing a real photo genuinely
 * takes longer than that, so a classic handler — which sends nothing until the
 * whole Anthropic call resolves — always trips it. Verified live: a real
 * 1200x1600 photo 504'd at 31.5s while a 1x1 test pixel returned in 6.6s.
 *
 * This keeps the connection alive by writing a byte every second while the
 * work runs, then the real JSON as the final chunk. Leading whitespace before
 * a JSON value is legal and JSON.parse ignores it, so the client just parses
 * the whole body normally.
 *
 * The HTTP status has to be committed before the async work finishes, so both
 * success and failure come back as 200; failures carry an `{ error }` body
 * that the client checks for explicitly.
 */
export function streamJson(compute: () => Promise<unknown>): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let done = false;

      // Start the work immediately, but don't await it here — the heartbeat
      // below has to keep writing while it runs.
      const work = compute().then(
        (value) => ({ ok: true as const, value }),
        (err) => ({ ok: false as const, err })
      );
      work.finally(() => {
        done = true;
      });

      const heartbeat = (async () => {
        while (!done) {
          await new Promise((r) => setTimeout(r, 1000));
          if (done) break;
          try {
            controller.enqueue(encoder.encode(" "));
          } catch {
            break; // client disconnected
          }
        }
      })();

      const result = await work;
      await heartbeat;

      try {
        if (result.ok) {
          controller.enqueue(encoder.encode(JSON.stringify(result.value)));
        } else {
          const err = result.err;
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: unknown }).message)
              : "Не удалось получить ответ от модели. Попробуй ещё раз.";
          console.error("[streamJson] compute failed:", err);
          controller.enqueue(encoder.encode(JSON.stringify({ error: message })));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
