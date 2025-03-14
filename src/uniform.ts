import { Vec2Array, Vec3Array, Vec4Array } from "./utils/vector";

export function uniform1f(name: string, value: number) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform1f(location, value)
  );
}

export function uniform2f(name: string, value: Vec2Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform2f(location, ...value)
  );
}

export function uniform3f(name: string, value: Vec3Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform3f(location, ...value)
  );
}

export function uniform4f(name: string, value: Vec4Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform4f(location, ...value)
  );
}

export function uniform1fv(name: string, value: [number]) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform1fv(location, value)
  );
}

export function uniform2fv(name: string, value: Vec2Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform2fv(location, value)
  );
}

export function uniform3fv(name: string, value: Vec3Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform3fv(location, value)
  );
}

export function uniform4fv(name: string, value: Vec4Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform4fv(location, value)
  );
}

export function uniform1iv(name: string, value: [number]) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform1iv(location, value)
  );
}

export function uniform2iv(name: string, value: Vec2Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform2iv(location, value)
  );
}

export function uniform3iv(name: string, value: Vec3Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform3iv(location, value)
  );
}

export function uniform4iv(name: string, value: Vec4Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform4iv(location, value)
  );
}

export function uniform1uiv(name: string, value: [number]) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform1uiv(location, value)
  );
}

export function uniform2uiv(name: string, value: Vec2Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform2uiv(location, value)
  );
}

export function uniform3uiv(name: string, value: Vec3Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform3uiv(location, value)
  );
}

export function uniform4uiv(name: string, value: Vec4Array) {
  return new Uniform(name, value, (gl, location) =>
    gl.uniform4uiv(location, value)
  );
}

class Uniform<T> {
  constructor(
    public name: string,
    private value: T,
    public updateFn: (
      gl: WebGL2RenderingContext,
      location: WebGLUniformLocation
    ) => void
  ) {}
  update(val: T): this {
    this.value = val;
    return this;
  }
  get(): T {
    return this.value;
  }
}

export class _Uniform<T> {
  public location: WebGLUniformLocation | null;

  constructor(
    public gl: WebGL2RenderingContext,
    public valueContainer: Uniform<T>
  ) {
    this.location = this.gl.getUniformLocation(
      this.gl,
      this.valueContainer.name
    );
  }

  updateLocation() {
    this.location = this.gl.getUniformLocation(
      this.gl,
      this.valueContainer.name
    );
    if (!location) return false;
    return true;
  }

  public updateValue(val: T) {
    return this.valueContainer.update(val);
  }

  public updateLocationAndValue(val: T) {
    return this.updateLocation() && this.valueContainer.update(val);
  }

  public getValue() {
    return this.valueContainer.get();
  }
}
