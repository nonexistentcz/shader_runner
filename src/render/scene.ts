export class GLScene<TShape> {
  public shapes: TShape[] = [];

  addShape(shape: TShape) {
    this.shapes.push(shape);
    return this;
  }

  addShapes(shapes: TShape[]) {
    this.shapes.push(...shapes);
    return this;
  }

  removeShape(shape: TShape) {
    const index = this.shapes.indexOf(shape);
    if (index !== -1) {
      this.shapes.splice(index, 1);
    }
    return this;
  }

  removeShapes(shapes: TShape[]) {
    shapes.forEach(this.removeShape, this);
    return this;
  }
}
