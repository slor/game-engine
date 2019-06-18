;(() => {
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
            this.components.forEach(function (elem, index){
                if(elem !== vector.components[index]){
                    result = false;
                }
            });

            return result;
        }
    }

    function test () {
        let vec = new Vector([1, 2, 3]);

        // Vector.dimension
        $GE.assert(3 === vec.dimension);

        // Vector.equals()
        $GE.assertFalse(vec.equals(new Vector([])));
        $GE.assertFalse(vec.equals(new Vector([1, 2])));
        $GE.assert(vec.equals(new Vector([1, 2, 3])));
        $GE.assertFalse(vec.equals(new Vector([1, 2, 3, 4])));

        // Vector.scale()
        $GE.assertFalse(vec.scale(2).equals(new Vector([2, 4, 7])));
        $GE.assert(vec.scale(2).equals(new Vector([2, 4, 6])));

        // Vector.add()
        $GE.assertFalse(vec.add(new Vector([2, 1, 1])).equals(new Vector([2, 3, 4])));
        $GE.assert(vec.add(new Vector([1, 1, 1])).equals(new Vector([2, 3, 4])));
    }

    $GE.Vector = Vector;
    $GE.tests.push(test);
})();
