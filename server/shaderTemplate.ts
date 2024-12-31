import { ShaderFile } from "./shaderFileTransformer";

const fragTemplate = `#version 300 es

#ifdef GL_ES
precision highp float;
#endif`;

export function shaderTemplate(source: ShaderFile) {
  if (source.filePath.endsWith(".frag"))
    return `${fragTemplate}\n\n${source.contents}`;
  return `#version 300 es\n\n${source.contents}`;
}
