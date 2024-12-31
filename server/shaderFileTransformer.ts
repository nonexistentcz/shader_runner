import { existsSync, readFileSync } from "fs";
import { ShaderTransformBuilder } from "./shaderTransformBuilder";
import { join } from "node:path";
export interface ShaderFileTransformerObject {
  new (source: ShaderFile): this;
  resolve: () => string;
}
export type ShaderFileTransformerFunction = (source: ShaderFile) => string;
export type ShaderFileTransformer =
  | ShaderFileTransformerFunction
  | ShaderFileTransformerObject;

export class ShaderFile {
  private static loadedShaders: Map<string, ShaderFile> = new Map();
  constructor(public filePath: string, public contents: string) {}

  static fromPath(filePath: string, basePath = "") {
    const instance = ShaderFile.loadedShaders.get(filePath);
    if (instance) return instance;
    const contents = readShaderContents(join(basePath, filePath));
    const shader = new ShaderFile(filePath, contents);
    ShaderFile.loadedShaders.set(filePath, shader);
    return shader;
  }

  getContents(
    transformFn?: (builder: ShaderTransformBuilder) => ShaderTransformBuilder
  ) {
    if (!transformFn) return this.contents;
    const builder = new ShaderTransformBuilder();
    return transformFn(builder).resolve(this).contents;
  }
}

function readShaderContents(filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error(`shader "${filePath}" doesn't exist`);
  }
  return readFileSync(filePath, { encoding: "utf8" });
}
