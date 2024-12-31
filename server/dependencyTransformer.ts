import { ShaderFile } from "./shaderFileTransformer";

const dependencyMap: Map<string, ShaderFile[]> = new Map();

export function dependencyTransformer(basePath = "") {
  return function transform(
    shaderNode: ShaderFile,
    stack = "",
    visited = new Set<string>()
  ): string {
    const newStack = `${stack} -> ${shaderNode.filePath}`;
    if (visited.has(shaderNode.filePath)) {
      throw new Error(`dependency cycle detected, require stack "${newStack}"`);
    }

    visited.add(shaderNode.filePath);
    let nodes = getMemoizedDependencies(shaderNode.filePath, basePath);
    const result = nodes
      .map((node) => transform(node, newStack, visited))
      .join("")
      .concat(
        `/// meta:path:${shaderNode.filePath}\n\n${shaderNode.getContents(
          (builder) => builder.use(metaRemover)
        )}\n`
      );

    visited.delete(shaderNode.filePath);

    return result;
  };
}

function getMemoizedDependencies(filePath: string, basePath = "") {
  const storedDependencies = dependencyMap.get(filePath);
  if (storedDependencies) return storedDependencies;
  const { contents } = ShaderFile.fromPath(filePath, basePath);
  const dependencies = getDependencies(contents, basePath);
  dependencyMap.set(filePath, dependencies);
  return dependencies;
}

function metaRemover({ contents }: ShaderFile) {
  return contents
    .split("\n")
    .filter((line) => !line.startsWith("/// use:"))
    .join("\n");
}

function getMeta(contents: string) {
  return contents
    .split("\n")
    .filter((line) => line.startsWith("/// use:"))
    .map((line) => line.replace(/^\/{3}/, ""))
    .map((line) => line.split(":")[1].trim());
}

function getDependencies(contents: string, basePath = "") {
  return getMeta(contents).map((filePath) =>
    ShaderFile.fromPath(filePath, basePath)
  );
}
