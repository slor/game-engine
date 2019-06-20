const m = require("./matrix.js");

var test = require('tape')

test('Mat2', t => {
    // 1 2
    // 3 4
    // 5 6
    let mat = new m.Mat2(1, 2, 3, 4, 5, 6);

    t.isEquivalent([1, 2, 3, 4, 5, 6], mat.elements);
    t.isEquivalent([1, 2], mat.row(0));
    t.isEquivalent([1, 3, 5], mat.col(0));
    t.isEqual(2, mat.ij(0, 1));
    t.isEquivalent(new m.Mat2(2, 4, 6, 8, 10, 12), mat.scale(2));
    t.isEquivalent(new m.Mat2(2, 3, 4, 5, 6, 7), mat.add(new m.Mat4(1, 1, 1, 1, 1, 1)), );
    t.end();
});

test('Mat3', t => {
    // 1 2 3
    // 4 5 6
    let mat = new m.Mat3(1, 2, 3, 4, 5, 6);

    t.isEquivalent([1, 2, 3, 4, 5, 6], mat.elements);
    t.isEquivalent([1, 2, 3], mat.row(0));
    t.isEquivalent([1, 4], mat.col(0));
    t.isEqual(3, mat.ij(0, 2));
    t.isEquivalent(new m.Mat3(2, 4, 6, 8, 10, 12), mat.scale(2), );
    t.isEquivalent(new m.Mat3(2, 3, 4, 5, 6, 7), mat.add(new m.Mat4(1, 1, 1, 1, 1, 1)));
    t.end();
});

test('Mat4', t => {
    // 1 2 3 4
    // 5 6 7 8
    let mat = new m.Mat4(1, 2, 3, 4, 5, 6, 7, 8);

    t.isEquivalent([1, 2, 3, 4, 5, 6, 7, 8], mat.elements);
    t.isEquivalent([1, 2, 3, 4], mat.row(0));
    t.isEquivalent([1, 5 ], mat.col(0));
    t.isEqual(6, mat.ij(1, 1));
    t.isEquivalent(new m.Mat4(2, 4, 6, 8, 10, 12, 14, 16), mat.scale(2));
    t.isEquivalent(new m.Mat4(2, 3, 4, 5, 6, 7, 8, 9), mat.add(new m.Mat4(1, 1, 1, 1, 1, 1, 1, 1)));
    t.end();
});

test('Vec2', t => {
    // 1
    // 2
    let vec = new m.Vec2(1, 2);

    t.isEquivalent(vec.components, [1, 2]);
    t.isEqual(vec.x, 1);
    t.isEqual(vec.y, 2);
    t.isEquivalent(new m.Vec2(5, 10), vec.scale(5));
    t.isEquivalent(new m.Vec2(4, 6), vec.add(new m.Vec2(3, 4)));

    t.end();
});

test('Vec3', t => {
    // 1
    // 2
    // 3
    let vec = new m.Vec3(1, 2, 3);

    t.isEquivalent(vec.components, [1, 2, 3]);
    t.isEqual(vec.x, 1);
    t.isEqual(vec.y, 2);
    t.isEqual(vec.z, 3);
    t.isEquivalent(new m.Vec3(5, 10, 15), vec.scale(5));
    t.isEquivalent(new m.Vec3(4, 6, 8), vec.add(new m.Vec3(3, 4, 5)));

    t.end();
});

test('Matrix multiplication', t => {
    let matA = new m.Mat2(0, 1, 0, 0);
    let matB = new m.Mat2(0, 0, 1, 0);

    t.isEquivalent(new m.Mat2(1, 0, 0, 0), matA.mult(matB));
    t.isEquivalent(new m.Mat2(0, 0, 0, 1), matB.mult(matA));

    t.end();
});

test('Matrix vector multiplication', t => {
    let mA = new m.Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
    let vX = new m.Vec3(-2, 1, 0);
    t.isEquivalent(new m.Vector(4, 0, -3, -6, -9), mA.mult(vX));

    t.end();
})