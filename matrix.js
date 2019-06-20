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

    scale(s) {
        // Scale each element by s.
        return this.elements.map(elem => {
            return s * elem;
        });
    }

    add(ml) {
        // Add to another Matrixlike.
        if(ml.elements.length !== this.elements.length){
            throw new Error('Cannot add: operands do not have the same number of elements.');
        }

        return this.elements.reduce((acc, curr, idx) => {
            acc.push(curr + ml.elements[idx]);
            return acc;
        }, []);
    }
}

class Mat3 extends Matrixlike {
    // An m by 3 matrix
    constructor(m, ...elements){
        super(m, 3, ...elements);
    }
}

class Mat4 extends Matrixlike {
    // An m by 4 matrix
    constructor(m, ...elements) {
        super(m, 4, ...elements);
    }
}

class Vector extends Matrixlike {
    // A vector
    constructor(dimension, ...components){
        // Storing the vector as if it was a <dim> by 1 matrix.
        super(dimension, 1, ...components);
        this.components = components;
    }

    comp(c) {
        // Get a zero-indexed component
        return super.row(c)[0];
    }
}

class Vec2 extends Vector {
    // A 2-dimensional vector
    constructor(x, y){
        super(2, x, y);
    }
}

class Vec3 extends Vector {
    // A 3-dimensional vector
    constructor(x, y, z){
        super(3, x, y, z);
    }
}