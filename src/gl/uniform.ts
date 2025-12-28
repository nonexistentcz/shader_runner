import { Matrix4x4, Vec2Array, Vec3Array, Vec4Array } from "../utils";

export function uniform1f(name: string, value: number) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform1f(location, this.value);
  });
}

export function uniform2f(name: string, value: Vec2Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform2f(location, ...this.value);
  });
}

export function uniform3f(name: string, value: Vec3Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform3f(location, ...this.value);
  });
}

export function uniform4f(name: string, value: Vec4Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform4f(location, ...this.value);
  });
}

export function uniform1fv(name: string, value: [number]) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform1fv(location, this.value);
  });
}

export function uniform2fv(name: string, value: Vec2Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform2fv(location, this.value);
  });
}

export function uniform3fv(name: string, value: Vec3Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform3fv(location, this.value);
  });
}

export function uniform4fv(name: string, value: Vec4Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform4fv(location, this.value);
  });
}

export function uniform1i(name: string, value: number) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform1i(location, this.value);
  });
}

export function uniform1iv(name: string, value: [number]) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform1iv(location, this.value);
  });
}

export function uniform2iv(name: string, value: Vec2Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform2iv(location, this.value);
  });
}

export function uniform3iv(name: string, value: Vec3Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform3iv(location, this.value);
  });
}

export function uniform4iv(name: string, value: Vec4Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform4iv(location, this.value);
  });
}

export function uniform1uiv(name: string, value: [number]) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform1uiv(location, this.value);
  });
}

export function uniform2uiv(name: string, value: Vec2Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform2uiv(location, this.value);
  });
}

export function uniform3uiv(name: string, value: Vec3Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    gl.uniform3uiv(location, this.value);
  });
}

export function uniform4uiv(name: string, value: Vec4Array) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniform4uiv(location, this.value);
  });
}

export function uniform4x4(name: string, value: Matrix4x4) {
  return new GLUniformValue(name, value, function (gl, location) {
    return gl.uniformMatrix4fv(location, false, this.value.toFlat());
  });
}

export class GLUniformValue<TValue> {
  private boundUniform: GLUniform<TValue> | null = null;

  constructor(
    public name: string,
    private _value: TValue,
    public _updateFn: (
      this: GLUniformValue<TValue>,
      gl: WebGL2RenderingContext,
      location: WebGLUniformLocation | null
    ) => void
  ) {}

  get value(): TValue {
    return this._value;
  }

  update(val: TValue): this {
    this._value = val;
    this.boundUniform?.updateValue();
    return this;
  }

  private bind(uniform: GLUniform<TValue>) {
    this.boundUniform = uniform;
    uniform.updateValue();
    return this;
  }

  getInternalValue() {
    return this.boundUniform?.getInternalValue();
  }
}

export class GLUniform<TValue> {
  public location: WebGLUniformLocation | null;

  constructor(
    public gl: WebGL2RenderingContext,
    private program: WebGLProgram,
    public valueContainer: GLUniformValue<TValue>
  ) {
    this.location = this.gl.getUniformLocation(
      program,
      this.valueContainer.name
    );

    this.valueContainer
      // @ts-expect-error
      .bind(this);
  }

  public updateValue() {
    this.valueContainer._updateFn(this.gl, this.location);
    return this;
  }

  public getValue() {
    return this.valueContainer.value;
  }

  public getInternalValue() {
    if (!this.location) return null;
    return this.gl.getUniform(this.program, this.location);
  }
}
