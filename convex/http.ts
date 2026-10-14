import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-kidzcoop-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function getToken(request: Request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return request.headers.get("x-kidzcoop-token") || "";
}

function safeErrorMessage(error: unknown, token: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  const withoutToken = token ? message.replaceAll(token, "[REDACTED]") : message;
  return withoutToken.replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]").slice(0, 2000);
}

function errorStatus(error: unknown, message: string) {
  const errorName = error instanceof Error ? error.name : "";
  if (/unauthorized/i.test(message)) return 401;
  if (errorName === "ArgumentValidationError" || /ArgumentValidationError|argument validation/i.test(message)) return 400;
  if (/already exists/i.test(message)) return 409;
  return 500;
}

http.route({
  path: "/api/articles/publish",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders() })),
});

http.route({
  path: "/api/articles/publish",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const token = getToken(request);
    const payload = await request.json();
    const incomingContent = payload.content || payload.article || payload;
    const incomingArticle = payload.articleGroup || {
      externalArticleId: incomingContent.externalArticleId,
      name: incomingContent.articleGroupName || incomingContent.title,
      category: incomingContent.category,
      imagePath: incomingContent.imagePath,
      deleted: false,
    };
    const result = await ctx.runMutation(api.articles.upsertContentFromMake, {
      token,
      article: incomingArticle,
      content: incomingContent,
      affiliates: payload.affiliates,
      source: "make",
    });

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }),
});

http.route({
  path: "/api/articles/create-strict",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders() })),
});

http.route({
  path: "/api/articles/create-strict",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let token = "";
    try {
      token = getToken(request);
      const payload = await request.json();
      const incomingContent = payload.content || payload.article || payload;
      const incomingArticle = payload.articleGroup || {
        externalArticleId: incomingContent.externalArticleId,
        name: incomingContent.articleGroupName || incomingContent.title,
        category: incomingContent.category,
        imagePath: incomingContent.imagePath,
        deleted: false,
      };
      const result = await ctx.runMutation(api.articles.createContentFromMakeStrict, {
        token,
        article: incomingArticle,
        content: incomingContent,
        affiliates: payload.affiliates,
        source: "make",
      });

      return new Response(JSON.stringify({ ok: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    } catch (error) {
      const message = safeErrorMessage(error, token);
      return new Response(
        JSON.stringify({
          ok: false,
          error: message,
        }),
        {
          status: errorStatus(error, message),
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        },
      );
    }
  }),
});

export default http;
