;(() => {
    class Matrix{
        // Row-major

        constructor(rows){
            this._rows = rows;
            this._N_ROWS = rows.length;

            // Assumes there are no holes
            // Assumes >= 1 rows
            this._N_COLS = this._rows[1].length;
            console.log();
        }

        get dimensions(){
            return [this._N_ROWS, this._N_COLS];
        }

        get rows(){
            return this._rows;
        }

        get columns() {
            let _cols = [];

            let col;
            for(col=0; col < this._N_COLS; col++){
                let row;

                _cols[col] = [];
                for(row=0; row < this._N_ROWS; row++){
                    _cols[col].push(this._rows[row][col])
                }
            }

            return _cols;
        }
    }

    function test () {
        let mat = new Matrix([
            [1, 2, 3],
            [4, 5, 6]
        ]);
        $GE.assert(2 === mat.dimensions[0])
        $GE.assert(3 === mat.dimensions[1])
        // console.log(mat.rows);
        console.log(mat.columns);
    }

    $GE.Matrix = Matrix;
    $GE.tests.push(test);
})();
