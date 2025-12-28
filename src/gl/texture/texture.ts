import { TextureTarget } from "../web-gl-enums";
import { TextureImage2DBuilder } from "./texture-image";
import { TexImage2DTarget } from "./types";

export class GLTexture {
  private update?: (gl: WebGL2RenderingContext) => void;

  constructor(
    private gl: WebGL2RenderingContext,
    private texture: WebGLTexture,
    private textureTarget: TextureTarget
  ) {}

  getTarget() {
    return this.textureTarget;
  }

  getTexture() {
    return this.texture;
  }

  bind(textureType = this.textureTarget) {
    this.gl.bindTexture(textureType, this.texture);
    return this;
  }

  unbind(textureType = this.textureTarget) {
    this.gl.bindTexture(textureType, null);
    return this;
  }

  texImage2D(
    target: TexImage2DTarget,
    levelOfDetail: number,
    build: (builder: TextureImage2DBuilder) => TextureImage2DBuilder
  ) {
    this.update = build(
      TextureImage2DBuilder.create(target, levelOfDetail)
    ).build();
    this.update(this.gl);

    return this;
  }

  generateMipmap() {
    this.gl.generateMipmap(this.textureTarget);
  }

  delete() {
    this.gl.deleteTexture(this.texture);
  }
}
