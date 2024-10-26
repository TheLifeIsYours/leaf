import { serveDir } from "jsr:@std/http@1/file-server";

Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;

  if (pathname.startsWith("/")) {
    return serveDir(req, {
      fsRoot: "src",
    });
  }

  return new Response();
});
