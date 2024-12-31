import express from "express";
import { ShaderFile } from "./shaderFileTransformer";
import { dependencyTransformer } from "./dependencyTransformer";
import { shaderTemplate } from "./shaderTemplate";

export async function getServer() {
  const router = express();
  router.get("/shader/:shader", (req, res) => {
    const fileName = req.params.shader;
    const basePath = "./src/shader/";
    res.send(
      ShaderFile.fromPath(fileName, basePath).getContents((builder) =>
        builder.use(dependencyTransformer(basePath)).use(shaderTemplate)
      )
    );
    res.status(200);
    res.type("text/plain");
  });
  return router;
}
