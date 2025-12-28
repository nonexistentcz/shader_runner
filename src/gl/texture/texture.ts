import { TextureTarget } from "../web-gl-enums";
import { TextureImage2DBuilder } from "./texture-image";
import { MinFilter, TexImage2DTarget } from "./types";

export class GLTexture {
  private _update?: (gl: WebGL2RenderingContext) => void;

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

  async fetchTexImg2D(
    src: string,
    target: TexImage2DTarget,
    levelOfDetail: number,
    build: (builder: TextureImage2DBuilder) => TextureImage2DBuilder
  ) {
    const img = await new Promise<HTMLImageElement>((resolve) => {
      const _img = new Image();
      _img.src = src;
      _img.onload = () => {
        _img.onload = null;
        resolve(_img);
      };
    });

    return this.texImage2D(target, levelOfDetail, (builder) =>
      build(builder).useSource({ dimensions: null, source: img })
    );
  }

  texImage2D(
    target: TexImage2DTarget,
    levelOfDetail: number,
    build: (builder: TextureImage2DBuilder) => TextureImage2DBuilder
  ) {
    this._update = build(
      TextureImage2DBuilder.create(target, levelOfDetail)
    ).build();
    this._update(this.gl);

    return this;
  }

  generateMipmap() {
    this.gl.generateMipmap(this.textureTarget);

    return this;
  }

  update() {
    this._update?.(this.gl);
    return this;
  }

  minFilter(filter: MinFilter) {
    this.gl.texParameteri(
      this.textureTarget,
      this.gl.TEXTURE_MIN_FILTER,
      filter
    );
    return this;
  }
  texParamenteri(param: GLenum, value: GLint) {
    this.gl.texParameteri(this.textureTarget, param, value);
    return this;
  }

  texParamenterf(param: GLenum, value: GLint) {
    this.gl.texParameterf(this.textureTarget, param, value);
    return this;
  }

  delete() {
    this.gl.deleteTexture(this.texture);
  }
}
