if (typeof $GE === "undefined") {
    $GE = {
        "tests": [],
        "test": null,
        "assert": null,
    };
}

$GE.assert = function(condition){
    if(false === condition){
        throw new Error('Assertion Failed');
    }
}

$GE.assertFalse = function (condition) {
    if (true == condition) {
        throw new Error('Assertion Failed');
    }
}

$GE.test = function () {
    this.tests.forEach(test => {
        test();
    });
}

