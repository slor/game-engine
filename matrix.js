;(() => {
    class Matrix{
        // Row-major
        constructor(elements, rowMode=true){
            // Assumes there are no holes
            if (rowMode === true){
                this._rows = elements;
                this._N_ROWS = elements.length;

                // Assumes >= 1 rows
                this._N_COLS = this._rows[1].length;
                this._columns = null;
            } else {
                this._columns = elements;
                this._N_COLS = elements.length;

                // Assumes >= 1 columns
                this._N_ROWS = this._columns[1].length;
                this._rows = null;
            }
        }

        get dimensions(){
            return [this._N_ROWS, this._N_COLS];
        }

        get rows(){
            if (this._rows !== null) {
                return this._rows;
            }

            let _rows = [];

            let row;
            for (row = 0; row < this._N_ROWS; row++){
                let col;

                _rows[row] = [];
                for(col=0; col < this._N_COLS; col++){
                    _rows[row].push(this._columns[col][row])
                }
            }

            this._rows = _rows;
            return this._rows;
        }

        get columns() {
            if(this._columns !== null){
                return this._columns;
            }

            let _cols = [];

            let col;
            for(col=0; col < this._N_COLS; col++){
                let row;

                _cols[col] = [];
                for(row=0; row < this._N_ROWS; row++){
                    _cols[col].push(this._rows[row][col])
                }
            }

            this._columns = _cols;
            return this._columns;
        }
    }


    function test () {
        let mat = new Matrix([
            [1, 2, 3],
            [4, 5, 6]
        ]);
        $GE.assert(2 === mat.dimensions[0])
        $GE.assert(3 === mat.dimensions[1])
        console.log(mat.rows);
        console.log(mat.columns);

        let mat2 = new Matrix([
            [1, 4],
            [2, 5],
            [3, 6]
        ], false);
        $GE.assert(2 === mat2.dimensions[0])
        $GE.assert(3 === mat2.dimensions[1])
        console.log(mat2.rows);
        console.log(mat2.columns);
    }

    $GE.Matrix = Matrix;
    $GE.tests.push(test);
})();
