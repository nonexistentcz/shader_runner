import { existsSync, readFileSync } from "fs";

class Shader {
  private static instances = new Map<string, Shader>();

  _meta?: string[];
  _dependencies?: Shader[];

  private constructor(public filePath: string, public contents: string) {}

  static fromPath(filePath: string) {
    const instance = Shader.instances.get(filePath);
    if (instance) return instance;
    const shader = new Shader(filePath, readShaderContents(filePath));
    Shader.instances.set(filePath, shader);
    return shader;
  }

  get meta() {
    if (!this._meta) {
      this._meta = this.contents
        .split("\n")
        .filter((line) => line.startsWith("///"))
        .map((line) => line.replace(/^\/{3}/, ""));
    }
    return this._meta;
  }

  get dependencies() {
    if (!this._dependencies) {
      this._dependencies = this.meta
        .map(getKeyValue)
        .map(([_, filePath]) => Shader.fromPath(filePath));
    }
    return this._dependencies;
  }

  resolve(stack = "", visited = new Set<this>()): string {
    const newStack = `${stack} -> ${this.filePath}`;
    if (visited.has(this)) {
      throw new Error(`dependency cycle detected, require stack "${newStack}"`);
    }

    visited.add(this);
    let nodes = this.dependencies;
    if (!nodes.length)
      return `/// meta:path:${this.filePath}\n\n${this.contents}`;
    return nodes.map((node) => node.resolve(newStack, visited)).join("");
  }
}

function getKeyValue(meta: string) {
  return meta.split(":").map((item) => item.trim());
}

export function transformShader(filePath: string) {
  Shader.fromPath(filePath).resolve();
}

function readShaderContents(filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error(`shader "${filePath}" doesn't exist`);
  }
  return readFileSync(filePath, { encoding: "utf8" });
}
