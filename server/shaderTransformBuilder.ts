import { ShaderFile, ShaderFileTransformer } from "./shaderFileTransformer";

export class ShaderTransformBuilder {
  private transformers: Array<ShaderFileTransformer> = [];

  use(transformer: ShaderFileTransformer) {
    this.transformers.push(transformer);
    return this;
  }

  resolve(source: ShaderFile) {
    return this.transformers.reduce((source, transformer) => {
      if ("resolve" in transformer)
        return new ShaderFile(
          source.filePath,
          new transformer(source).resolve()
        );
      return new ShaderFile(source.filePath, transformer(source));
    }, source);
  }
}
