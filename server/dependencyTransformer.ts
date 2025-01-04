import { ShaderFile } from "./shaderFileTransformer";

const dependencyMap: Map<string, ShaderFile[]> = new Map();

export function dependencyTransformer(basePath = "") {
  const visited = new Set<string>();
  const stack: string[] = [];
  const imported = new Set<string>();
  return function transform(shaderNode: ShaderFile): string {
    stack.push(shaderNode.filePath);
    if (visited.has(shaderNode.filePath)) {
      throw new Error(
        `dependency cycle detected, require stack "${stack.join(" -> ")}"`
      );
    }
    if (imported.has(shaderNode.filePath)) return "";
    visited.add(shaderNode.filePath);
    imported.add(shaderNode.filePath);
    let nodes = getMemoizedDependencies(shaderNode, basePath);
    const result = nodes
      .map((node) => transform(node))
      .join("")
      .concat(
        `/// meta:path:${shaderNode.filePath}\n${shaderNode.getContents(
          (builder) => builder.use(metaRemover)
        )}\n`
      );

    visited.delete(shaderNode.filePath);
    stack.pop();

    return result;
  };
}

function getMemoizedDependencies(
  { filePath, isInvalid }: ShaderFile,
  basePath = ""
) {
  const storedDependencies = dependencyMap.get(filePath);
  if (!isInvalid && storedDependencies) return storedDependencies;
  const { contents } = ShaderFile.fromPath(filePath, basePath);
  const dependencies = getDependencies(contents, basePath);
  dependencyMap.set(filePath, dependencies);
  return dependencies;
}

const META_REGEX = /^\/\/\/\s*use/;

function metaRemover({ contents }: ShaderFile) {
  return contents
    .split("\n")
    .filter((line) => !META_REGEX.test(line))
    .join("\n");
}

function getMeta(contents: string) {
  return contents
    .split("\n")
    .filter((line) => META_REGEX.test(line))
    .map((line) => line.replace(META_REGEX, ""))
    .map((line) => line.split(":")[1].trim());
}

function getDependencies(contents: string, basePath = "") {
  return getMeta(contents).map((filePath) =>
    ShaderFile.fromPath(filePath, basePath)
  );
}
