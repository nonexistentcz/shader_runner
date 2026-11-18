import express from "express";
import { ShaderFile } from "./shaderFileTransformer";
import { shaderTemplate } from "./shaderTemplate";
import { watch } from "node:fs";
import { shaderModuleTransformer } from "./shaderModuleTransformer";

const BASE_PATH = "./src/shader/";

// editors that save atomically (write temp file + rename) emit "rename", not "change"
// recursive so changes to imported modules (e.g. module/noise.glsl) invalidate too
watch(BASE_PATH, { recursive: true }, (_type, fileName) => {
  if (!fileName) return;
  ShaderFile.invalidate(fileName);
});

export async function getServer() {
  const app = express();

  const router = express.Router();
  router.get("/shader/:shader", (req, res) => {
    const fileName = req.params.shader;
    res.status(200);
    res.type("text/plain");
    res.send(
      ShaderFile.fromPath(fileName, BASE_PATH).getContents((builder) =>
        builder.use(shaderModuleTransformer(BASE_PATH)).use(shaderTemplate)
      )
    );
  });

  app.use(router);
  app.use(express.static("public"));

  return app;
}
