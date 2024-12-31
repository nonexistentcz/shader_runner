import express from "express";
import { ShaderFile } from "./shaderFileTransformer";
import { dependencyTransformer } from "./dependencyTransformer";
import { shaderTemplate } from "./shaderTemplate";
import nocache from "nocache";

export async function getServer() {
  const app = express();
  const router = express.Router().use(nocache());
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
  app.use(router);
  return app;
}
