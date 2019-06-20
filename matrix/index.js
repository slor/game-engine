class Matrixlike {
    // Row-major
    constructor(m, n, ...elements){
        this.elements = elements;
        this.m = m;
        this.n = n;
    }

    row(r) {
        // Get a single zero-indexed row.
        return this.elements.slice(r * this.n, r * this.n + this.n);
    }

    col(c) {
        // Get a single zero-indexed column.
        return this.elements.reduce((acc, curr, idx) => {
            if (idx % this.n === c) {
                acc.push(curr);
            }

            return acc;
        }, []);
    }

    ij(i, j){
        return this.row(i)[j];
    }

    scale(s) {
        // Scale each element by s.
        let elements = this.elements.map(elem => {
            return s * elem;
        });

        return new Matrixlike(this.m, this.n, ...elements);
    }

    add(ml) {
        // Add to another Matrixlike.
        if(ml.elements.length !== this.elements.length){
            throw new Error('Cannot add: operands do not have the same number of elements.');
        }

        let elements = this.elements.reduce((acc, curr, idx) => {
            acc.push(curr + ml.elements[idx]);
            return acc;
        }, []);

        return new Matrixlike(this.m, this.n, ...elements);
    }

    mult(ml){
        // Multiply with another Matrixlike.
        //
        // Given A is m × n and B is n × p,
        // AB = C where C is m × p.
        //
        // A.mult(B) -> AB -> A(B) -> [... C elements ...] != B.mult(A)
        //
        // Cij = sum r=0 until n of Air*Brj,
        // for 0 <= i < m and 0 <= j < p
        let a = this;
        let b = ml;
        let m = a.m;
        let n = a.n;
        let p = b.n;
        let c = [];

        let i;
        let j;
        let r;
        for(i = 0; i < m; i++){
            for(j = 0; j < p; j++){
                let cij = 0;
                for(r = 0; r < n; r++){
                    cij += a.ij(i, r) * b.ij(r, j);
                }
                c.push(cij)
            }
        }
        return new Matrixlike(m, p, ...c);
    }
}

class Mat2 extends Matrixlike {
    // An m × 2 matrix
    constructor(...elements) {
        let m = elements.length / 2;
        super(m, 2, ...elements);
    }
}

class Mat3 extends Matrixlike {
    // An m × 3 matrix
    constructor(...elements){
        let m = elements.length / 3;
        super(m, 3, ...elements);
    }
}

class Mat4 extends Matrixlike {
    // An m × 4 matrix
    constructor(...elements) {
        let m = elements.length / 4;
        super(m, 4, ...elements);
    }
}

class Vector extends Matrixlike {
    // A vector
    constructor(dimension, ...components){
        // Storing the vector as if it was a <dim> by 1 matrix.
        super(dimension, 1, ...components);
    }

    get components(){
        return this.elements;
    }

    comp(c) {
        // Get a zero-indexed component
        return super.ij(c, 0);
    }
}

class Vec2 extends Vector {
    // A 2-dimensional vector
    constructor(x, y){
        super(2, x, y);
    }

    get x(){
        return this.comp(0);
    }

    get y() {
        return this.comp(1);
    }
}

class Vec3 extends Vector {
    // A 3-dimensional vector
    constructor(x, y, z){
        super(3, x, y, z);
    }

    get x() {
        return this.comp(0);
    }

    get y() {
        return this.comp(1);
    }

    get z() {
        return this.comp(2);
    }
}

exports.Mat2 = Mat2;
exports.Mat3 = Mat3;
exports.Mat4 = Mat4;
exports.Vec2 = Vec2;
exports.Vec3 = Vec3;
exports.Vector = Vector;