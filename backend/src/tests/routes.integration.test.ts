import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimitersForTests } from "../middleware/rate-limit.js";
import { createServer } from "../server.js";

const MINIMAL_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe("HTTP routes", () => {
  const app = createServer();

  beforeEach(() => {
    resetRateLimitersForTests();
  });

  it("GET /api/health returns JSON with bootstrap fields", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: expect.any(Boolean),
      productCount: expect.any(Number),
      lexicalReady: expect.any(Boolean),
      embeddingsReady: expect.any(Boolean),
    });
  });

  it("POST /api/admin/reindex with empty llmConfig returns 400", async () => {
    const res = await request(app).post("/api/admin/reindex").send({ llmConfig: {} });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/search without image returns 400", async () => {
    const res = await request(app).post("/api/search");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MISSING_IMAGE");
  });

  it("POST /api/search with invalid JSON payload returns 400", async () => {
    const res = await request(app)
      .post("/api/search")
      .field("payload", "{not json")
      .attach("image", MINIMAL_PNG, { filename: "test.png", contentType: "image/png" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("POST /api/search rejects non-image bytes", async () => {
    const res = await request(app)
      .post("/api/search")
      .field(
        "payload",
        JSON.stringify({
          llmConfig: { apiKey: "sk-test" },
        }),
      )
      .attach("image", Buffer.from("not an image"), {
        filename: "fake.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_IMAGE_TYPE");
  });

  it("POST /api/eval/run with invalid retrievalConfig returns 400", async () => {
    const res = await request(app)
      .post("/api/eval/run")
      .send({
        llmConfig: { apiKey: "sk-test" },
        retrievalConfig: { k: "not-a-number" },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/eval/run rejects disallowed LLM baseUrl", async () => {
    const res = await request(app)
      .post("/api/eval/run")
      .send({
        llmConfig: {
          apiKey: "sk-test",
          baseUrl: "http://169.254.169.254/",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_LLM_URL");
  });

  it("POST /api/lexical/debug with empty body returns 400", async () => {
    const res = await request(app).post("/api/lexical/debug").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
