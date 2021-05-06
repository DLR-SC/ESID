import * as util from 'util/util';

describe('deepCopy', () => {
  test('object', () => {
    const object = {a: 0, b: 'test'};
    const copiedObject = util.deepCopy(object);

    expect(copiedObject).toStrictEqual(object);
    expect(copiedObject).not.toBe(object);
  });

  test('array', () => {
    const array = [0, 1, 2];
    const copiedArray = util.deepCopy(array);

    expect(copiedArray).toStrictEqual(array);
    expect(copiedArray).not.toBe(array);
  });

  test('compound', () => {
    const object = {a: 0, b: [1, 2, 3], c: {d: 'test'}};
    const copiedObject = util.deepCopy(object);

    expect(copiedObject).toStrictEqual(object);
    expect(copiedObject).not.toBe(object);
  });
});
