export interface GLTransformerObject {
  new (source: string): this;
  resolve: () => string;
}
export type GLTransformerFunction = (source: string) => string;
export type GLTransformer = GLTransformerFunction | GLTransformerObject;
