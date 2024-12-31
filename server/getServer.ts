import express from "express";
import { ShaderFile } from "./shaderFileTransformer";
import { dependencyTransformer } from "./dependencyTransformer";
import { shaderTemplate } from "./shaderTemplate";
import nocache from "nocache";
import { watch } from "node:fs";

const basePath = "./src/shader/";

export async function getServer() {
  const app = express();

  const router = express.Router().use(nocache());
  router.get("/shader/:shader", (req, res) => {
    const fileName = req.params.shader;
    res.status(200);
    res.type("text/plain");
    res.send(
      ShaderFile.fromPath(fileName, basePath).getContents((builder) =>
        builder.use(dependencyTransformer(basePath)).use(shaderTemplate)
      )
    );
  });
  app.use(router);

  watch(basePath, (_, fileName) => {
    if (!fileName) return;
    ShaderFile.invalidate(fileName);
    console.log(`invalidating: ${fileName}`);
  });
  return app;
}
