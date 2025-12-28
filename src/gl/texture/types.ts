import { Vec2 } from "../../utils";

export enum TexImage2DTarget {
  Tex2D = WebGL2RenderingContext.TEXTURE_2D,
  TexCubeMapNegativeX = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
  TexCubeMapNegativeY = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
  TexCubeMapNegativeZ = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  TexCubeMapPositiveX = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
  TexCubeMapPositiveY = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
  TexCubeMapPositiveZ = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
}

export enum TextureInternalFormat {
  RGB = WebGL2RenderingContext.RGB,
  RGBA = WebGL2RenderingContext.RGBA,
  LuminanceAlpha = WebGL2RenderingContext.LUMINANCE_ALPHA,
  Luminance = WebGL2RenderingContext.LUMINANCE,
  Alpha = WebGL2RenderingContext.ALPHA,
}

export enum TextureIntSizes {
  UnsignedByte = WebGL2RenderingContext.UNSIGNED_BYTE,
  UnsignedShort565 = WebGL2RenderingContext.UNSIGNED_SHORT_5_6_5,
  UnsignedShort4444 = WebGL2RenderingContext.UNSIGNED_SHORT_4_4_4_4,
  UnsignedShort5551 = WebGL2RenderingContext.UNSIGNED_SHORT_5_5_5_1,
}

export type TextureIntSizesResolved<TFormat extends TextureInternalFormat> =
  TFormat extends TextureInternalFormat.RGB
    ? TextureIntSizes.UnsignedByte | TextureIntSizes.UnsignedShort565
    : TFormat extends TextureInternalFormat.RGBA
    ?
        | TextureIntSizes.UnsignedByte
        | TextureIntSizes.UnsignedShort4444
        | TextureIntSizes.UnsignedShort5551
    : TextureIntSizes.UnsignedByte;

export type TextureDimensions = Vec2;

export enum TextureSourceType {
  Source,
  SourceData,
  // TODO: support gl.PIXEL_UNPACK buffer
  // SourcePointer
}

export type TextureImageSource = {
  type: TextureSourceType.Source;
  dimensions: TextureDimensions | null;
  source: TexImageSource;
};

export type TextureImageSourceData = {
  type: TextureSourceType.SourceData;
  dimensions: TextureDimensions;
  source: ArrayBufferView<ArrayBufferLike> | null;
};

export type TextureImageSourceInfo =
  | TextureImageSource
  | TextureImageSourceData;
