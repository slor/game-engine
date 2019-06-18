class Vector{
    constructor(components){
        this._components = components;
    }

    get components(){
        return this._components;
    }

    get dimension(){
        return this.components.length;
    }

    scale(scalar){
        return new Vector(this.components.map(component => scalar * component ));
    }

    add(vector){
        let sum = [];

        this.components.forEach((element, index) => {
            sum[index] = element + vector.components[index];
        });
        return new Vector(sum);
    }

    equals(vector){
        // true if elements are identical
        if(this.dimension !== vector.dimension){
            return false;
        }

        let result = true;
        this.components.reduce((elem, index) => elem !== vector.components[index], result);

        return result;
    }
}

// TODO: write proper tests
let vec = new Vector([1, 2, 3]);

// Vector.dimension
console.assert(3 === vec.dimension);

// Vector.equals()
console.assert(false === vec.equals(new Vector([])));
console.assert(false === vec.equals(new Vector([1, 2])));
console.assert(true === vec.equals(new Vector([1, 2, 3])));
console.assert(false === vec.equals(new Vector([1, 2, 3, 4])));

// Vector.scale()
console.assert(vec.scale(2).equals(new Vector([2, 4, 6])));

// Vector.add()
console.assert(vec.add(new Vector([1, 1, 1])).equals(new Vector([2, 3, 4])));
