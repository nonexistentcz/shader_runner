import express from "express";
import { ShaderFile } from "./shaderFileTransformer";
import { shaderTemplate } from "./shaderTemplate";
import { watch } from "node:fs";
import { shaderModuleTransformer } from "./shaderModuleTransformer";

const BASE_PATH = "./src/shader/";

watch(BASE_PATH, (type, fileName) => {
  if (!fileName || type === "rename") return;
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
