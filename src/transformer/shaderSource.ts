import { GLTransformer } from "./types";

export class GLShaderSource {
  private transformers: Array<GLTransformer> = [];

  use(transformer: GLTransformer) {
    this.transformers.push(transformer);
    return this;
  }

  resolve(source: string) {
    return this.transformers.reduce((source, transformer) => {
      if ("resolve" in transformer) return new transformer(source).resolve();
      return transformer(source);
    }, source);
  }
}
