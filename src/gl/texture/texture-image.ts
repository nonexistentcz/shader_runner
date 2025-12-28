import {
  TexImage2DTarget,
  TextureInternalFormat,
  TextureIntSizes,
  TextureImageSourceInfo,
  TextureIntSizesResolved,
  TextureImageSource,
  TextureImageSourceData,
  TextureSourceType,
} from "./types";

export class TextureImage2DBuilder {
  private constructor(
    private target: TexImage2DTarget,
    private levelOfDetail: number,
    private format = TextureInternalFormat.RGB,
    private intSizes = TextureIntSizes.UnsignedByte,
    private sourceInfo: TextureImageSourceInfo | null = null
  ) {}

  static create(target: TexImage2DTarget, levelOfDetail: number) {
    return new this(target, levelOfDetail);
  }

  setTextureDetails<TFormat extends TextureInternalFormat>(
    internalFormat: TFormat,
    intSizes: TextureIntSizesResolved<TFormat>
  ) {
    this.format = internalFormat;
    this.intSizes = intSizes;
    return this;
  }

  useSource(data: Omit<TextureImageSource, "type">) {
    this.sourceInfo = { type: TextureSourceType.Source, ...data };

    return this;
  }

  useSourceData(data: Omit<TextureImageSourceData, "type">) {
    this.sourceInfo = { type: TextureSourceType.SourceData, ...data };

    return this;
  }

  build(): (gl: WebGL2RenderingContext) => void {
    if (!this.sourceInfo)
      throw new Error(
        "Source info not passed, call useSourceData or useSource on TextureImage2DBuilder"
      );
    if (this.sourceInfo.type === TextureSourceType.Source) {
      const { dimensions, source } = this.sourceInfo!;

      if (!dimensions) {
        return (gl) =>
          gl.texImage2D(
            this.target,
            this.levelOfDetail,
            this.format,
            this.format,
            this.intSizes,
            source
          );
      }
      return (gl) =>
        gl.texImage2D(
          this.target,
          this.levelOfDetail,
          this.format,
          dimensions.x,
          dimensions.y,
          0,
          this.format,
          this.intSizes,
          source
        );
    }

    const { dimensions, source } = this.sourceInfo!;

    return (gl) =>
      gl.texImage2D(
        this.target,
        this.levelOfDetail,
        this.format,
        dimensions.x,
        dimensions.y,
        0,
        this.format,
        this.intSizes,
        source
      );
  }
}
