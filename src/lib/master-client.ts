interface SendResult {
  ok: boolean;
  message: string | null;
}

export async function sendJson(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<SendResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok || !json?.success) {
      return { ok: false, message: json?.message ?? "The request failed." };
    }
    return { ok: true, message: null };
  } catch {
    return { ok: false, message: "Network error. Please try again." };
  }
}
