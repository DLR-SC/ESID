import * as util from 'util/util';

test('deepCopy', () => {
  const object = {a: 0, b: [1, 2, 3], c: {d: 'test'}};
  const copiedObject = util.deepCopy(object);

  expect(copiedObject).toStrictEqual(object);
  expect(copiedObject).not.toBe(object);

  const array = [0, 1, 2];
  const copiedArray = util.deepCopy(array);

  expect(copiedArray).toStrictEqual(array);
  expect(copiedArray).not.toBe(array);
});
