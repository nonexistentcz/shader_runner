import { Vec3Array, Vec4Array } from "../vector";
import Matrix3x3 from "./matrix3x3";
import Matrix4x4 from "./matrix4x4";

export type Matrix3x3Array = [Vec3Array, Vec3Array, Vec3Array];
export type Matrix4x4Array = [Vec4Array, Vec4Array, Vec4Array, Vec4Array];
export type Matrix4x4Union = Matrix4x4 | Matrix4x4Array;
export type Matrix3x3Union = Matrix3x3 | Matrix3x3Array;
