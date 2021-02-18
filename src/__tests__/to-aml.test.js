import archieml from 'archieml';

import toAml from '../to-aml.js';

function assert(obj, debug = false) {
  const text = toAml(obj);

  if (debug) {
    console.log(text);
  }

  expect(archieml.load(text)).toEqual(obj);
}

describe('arrays', function () {
  test('1. [array] creates an empty array at array', function () {
    assert({ array: [] });
  });

  test('8. array values can be nested using dot-notaion', function () {
    assert({
      array: [{ scope: { key: 'value' } }, { scope: { key: 'value' } }],
    });
  });

  test('9. [] resets to the global scope', function () {
    assert({ array: [], key: 'value' });
  });
});

describe('arrays_complex', function () {
  test('1. keys after an [array] are included as items in the array', function () {
    assert({ array: [{ key: 'value' }] });
  });

  test('2. array items can have multiple keys', function () {
    assert({ array: [{ key: 'value', second: 'value' }] });
  });

  test('3. when a duplicate key is encountered, a new item in the array is started', function () {
    assert({ array: [{ key: 'value', second: 'value' }, { key: 'value' }] });
  });

  test('4. when a duplicate key is encountered, a new item in the array is started', function () {
    assert({ array: [{ key: 'first' }, { key: 'second' }] });
  });

  test('5. when a duplicate key is countered, a new item in the array is started', function () {
    assert({
      array: [{ scope: { key: 'first' } }, { scope: { key: 'second' } }],
    });
  });

  test('6. duplicate keys must match on dot-notation scope', function () {
    assert({ array: [{ key: 'value', scope: { key: 'value' } }] });
  });

  test('7. duplicate keys must match on dot-notation scope', function () {
    assert({
      array: [
        { scope: { key: 'value' }, key: 'value', otherscope: { key: 'value' } },
      ],
    });
  });

  test('8. arrays within a multi-line value breaks up the value', function () {
    assert({ array1: [{ key: 'value' }], array2: [] });
  });

  test('9. objects within a multi-line value breaks up the value', function () {
    assert({ array: [{ key: 'value' }], scope: {} });
  });

  // test('10. key/values within a multi-line value break up the value', function () {
  //   assert({ array: [{ key: 'value', other: 'value\nmore text' }] });
  // });

  // test('11. bullets within a multi-line value do not break up the value', function () {
  //   assert({ array: [{ key: 'value\n* value\nmore text' }] });
  // });

  test('14. complex arrays can be redefined as simple arrays', function () {
    assert({ array: ['Value'] });
  });

  test('15. complex ararys overwrite existing keys', function () {
    assert({ a: { b: [{ key: 'value' }] } });
  });
});

describe('arrays_nested', function () {
  test('1. array keys beginning with [.dots] create complex subarrays', function () {
    assert({ array: [{ subarray: [{ key: 'value' }] }] });
  });

  test('2. array keys beginning with [.dots] create simple subarrays', function () {
    assert({ array: [{ subarray: ['Value 1', 'Value 2'] }] });
  });

  test('3. subarrays can contain multiple complex values', function () {
    assert({ array: [{ subarray: [{ key: 'value' }, { key: 'value' }] }] });
  });

  test('4. subarrays can contain objects with multiple keys', function () {
    assert({
      array: [
        {
          subarray: [
            { key1: 'value', key2: 'value' },
            { key1: 'value', key2: 'value' },
          ],
        },
      ],
    });
  });

  test('5. subarrays can be closed to return to the parent level', function () {
    assert({
      array: [{ parentkey: 'value', subarray: [{ subkey: 'value' }] }],
    });
  });

  test('7. subarrays do not affect the parent keeping track of the item delimiter key', function () {
    assert({
      array: [
        { key: 'value', subarray: [{ subkey: 'value' }] },
        { key: 'value' },
      ],
    });
  });

  test('9. subarrays can server as the item delimiter key', function () {
    assert({ array: [{ subarray: [] }, { subarray: [] }] });
  });

  test('10. subarrays can contain complex subarrays', function () {
    assert({
      array: [
        { subarray: [{ subsubarray: [{ key1: 'Value 1', key2: 'Value 2' }] }] },
      ],
    });
  });

  test('11. subarrays can contain simple subarrays', function () {
    assert({
      array: [{ subarray: [{ subsubarray: ['Value 1', 'Value 2'] }] }],
    });
  });
});

describe('arrays_simple', function () {
  test('1. creates a simple array when an * is encountered first', function () {
    assert({ array: ['Value'] });
  });

  test('4. adds multiple elements', function () {
    assert({ array: ['Value 1', 'Value 2'] });
  });

  test('7. parses key:values normally after an end-array', function () {
    assert({ array: ['Value 1'], key: 'value' });
  });

  // test('8. multi-line values are allowed', function () {
  //   assert({ array: ['Value 1\nextra'] });
  // });

  // test('9. allows escaping of * within multi-line values in simple arrays', function () {
  //   assert({ array: ['Value 1\n* extra'] });
  // });

  // test('10. allows escaping of command keys within multi-line values', function () {
  //   assert({ array: ['Value1\n:end'] });
  // });

  // test('11. does not allow escaping of keys within multi-line values', function () {
  //   assert({ array: ['Value1\nkey\\:value'] });
  // });

  // test('12. allows escaping key lines with a leading backslash', function () {
  //   assert({ array: ['Value\nkey:value'] });
  // });

  // test('13. does not allow escaping of colons not at the beginning of lines', function () {
  //   assert({ array: ['Value 1\nword key\\:value'] });
  // });

  test('14. arrays within a multi-line value breaks up the value', function () {
    assert({ array1: ['value'], array2: [] });
  });

  test('15. objects within a multi-line value break up the value', function () {
    assert({ array: ['value'], scope: {} });
  });

  // test('16. key/values within a multi-line value do not break up the value', function () {
  //   assert({ array: ['value\nkey: value\nmore text'] });
  // });

  // test('17. bullets within a multi-line value break up the value', function () {
  //   assert({ array: ['value', 'value\nmore text'] });
  // });

  test('21. simple arrays overwrite existing keys', function () {
    assert({ a: { b: ['simple value'] } });
  });
});

describe('freeform', function () {
  test('1. Strings are converted to objects with key=text', function () {
    assert({ freeform: [{ type: 'text', value: 'Value' }] });
  });

  test('2. Key-value pairs are turned into key-value objects', function () {
    assert({ freeform: [{ type: 'name', value: 'value' }] });
  });

  test('3. Text and key-value pairs can be combined', function () {
    assert({
      freeform: [
        { type: 'text', value: 'Value' },
        { type: 'name', value: 'value' },
        { type: 'text', value: 'Value' },
        { type: 'name', value: 'value' },
      ],
    });
  });

  test('4. Text and key-value pairs can be combined and sequential', function () {
    assert({
      freeform: [
        { type: 'text', value: 'Value' },
        { type: 'text', value: 'Value' },
        { type: 'name', value: 'value' },
        { type: 'name', value: 'value' },
      ],
    });
  });

  test('5. Objects nested in freeforms', function () {
    assert({
      freeform: [
        { type: 'type', value: 'value' },
        { type: 'text', value: 'Text' },
        { type: 'image', value: { name: 'map.jpg', credit: 'Photographer' } },
      ],
    });
  });

  test('6. Simple arrays nested in freeforms', function () {
    assert({ freeform: [{ type: 'simple', value: ['Value 1', 'Value 2'] }] });
  });

  test('7. Freeforms nested in arrays', function () {
    assert({
      array: [
        {
          name: 'value',
          freeform: [
            { type: 'name', value: 'value' },
            { type: 'text', value: 'Text' },
          ],
        },
      ],
    });
  });

  test("8. Don't parse whitespace lines", function () {
    assert({
      freeform: [
        { type: 'text', value: 'one' },
        { type: 'text', value: 'two' },
      ],
    });
  });

  test('10. Freeforms. nested in scopes', function () {
    assert({ scope: { freeform: [{ type: 'text', value: 'Value' }] } });
  });

  test('11. Freeforms nested in freeforms', function () {
    assert({
      freeform: [
        { type: 'freeform', value: [{ type: 'text', value: 'Text' }] },
      ],
    });
  });

  test('12. Scoped complex arrays nested in freeforms', function () {
    assert({
      freeform: [
        { type: 'array.complex', value: [{ key1: 'value1', key2: 'value2' }] },
      ],
    });
  });

  test('13. Complex arrays nested in freeforms', function () {
    assert({
      freeform: [
        { type: 'complex', value: [{ key1: 'value1', key2: 'value2' }] },
      ],
    });
  });

  test('14. {} does not reset to global scope within freeforms', function () {
    assert({
      freeform: [
        { type: 'scope', value: {} },
        { type: 'key', value: 'value' },
      ],
    });
  });

  test('15. [] does not reset to global scope within freeforms', function () {
    assert({
      freeform: [
        { type: 'array', value: [] },
        { type: 'key', value: 'value' },
      ],
    });
  });

  test('16. Scoped simple arrays nested in freeforms', function () {
    assert({
      freeform: [{ type: 'array.simple', value: ['value1', 'value2'] }],
    });
  });

  test('17. scoped objects in freeforms', function () {
    assert({
      freeform: [
        { type: 'object.scope', value: { key1: 'value1', key2: 'value2' } },
      ],
    });
  });

  test('18. dot-notation should be become part of the type value within freeforms', function () {
    assert({ freeform: [{ type: 'scope.key', value: 'value' }] });
  });

  test('19. Bullet strings are converted to objects with key=text, and bullets are not stripped', function () {
    assert({ freeform: [{ type: 'text', value: '* value' }] });
  });
});

describe('ignore', function () {
  test('1. text before :ignore should be included', function () {
    assert({ key: 'value' });
  });

  test('2. text after :ignore should be ignored', function () {
    assert({});
  });
});

describe('keys', function () {
  test('1. letters, numbers, dashes and underscores are valid key components', function () {
    assert({ 'a-_1': 'value' });
  });

  test('4. keys can be nested using dot-notation', function () {
    assert({ scope: { key: 'value' } });
  });

  test("5. earlier keys within scopes aren't deleted when using dot-notation", function () {
    assert({ scope: { key: 'value', otherkey: 'value' } });
  });

  test('6. values are converted between objects and strings as necessary', function () {
    assert({
      string_to_object: { scope: { scope: 'value' } },
      object_to_string: { scope: 'value' },
    });
  });
});

describe('multi_line', function () {
  // test('1. adds additional lines to value if followed by an :end', function () {
  //   assert({ key: 'value\nextra' });
  // });

  // test('3. preserves blank lines and whitespace lines in the middle of content', function () {
  //   assert({ key: 'value\n\n\t \nextra' });
  // });

  // test('5. preserves whitespace at the end of the original line', function () {
  //   assert({ key: 'value\t \nextra' });
  // });

  // test('11. ordinary text that starts with a colon is included', function () {
  //   assert({ key: 'value\n:notacommand' });
  // });

  test('14. does not escape colons on first line', function () {
    assert({ key: ':value' });
  });

  test('15. does not escape colons on first line', function () {
    assert({ key: '\\:value' });
  });

  // test('16. does not allow escaping colons in keys', function () {
  //   assert({ key: 'value\nkey2\\:value' });
  // });

  // test('17. allows escaping key lines with a leading backslash', function () {
  //   assert({ key: 'value\nkey2:value' });
  // });

  // test('18. allows escaping commands at the beginning of lines', function () {
  //   assert({ key: 'value\n:end' });
  // });

  // test('19. allows escaping commands with extra text at the beginning of lines', function () {
  //   assert({ key: 'value\n:endthis' });
  // });

  // test('20. allows escaping of non-commands at the beginning of lines', function () {
  //   assert({ key: 'value\n:notacommand' });
  // });

  // test('21. allows simple array style lines', function () {
  //   assert({ key: 'value\n* value' });
  // });

  // test('23. allows escaping {scopes} at the beginning of lines', function () {
  //   assert({ key: 'value\n{scope}' });
  // });

  test('26. arrays within a multi-line value breaks up the value', function () {
    assert({ key: 'value', array: [] });
  });

  test('27. objects within a multi-line value breaks up the value', function () {
    assert({ key: 'value', scope: {} });
  });

  // test('28. bullets within a multi-line value do not break up the value', function () {
  //   assert({ key: 'value\ntext\n* value\nmore text' });
  // });

  // test('30. allows escaping initial backslash at the beginning of lines', function () {
  //   assert({ key: 'value\n\\:end' });
  // });

  // test('31. escapes only one initial backslash', function () {
  //   assert({ key: 'value\n\\\\:end' });
  // });

  // test('32. allows escaping multiple lines in a value', function () {
  //   assert({ key: 'value\n:end\n:ignore\n:endskip\n:skip' });
  // });

  // test('33. does not escape colons after beginning of lines', function () {
  //   assert({ key: 'value\nLorem key2\\\\:value' });
  // });

  // test('34. bullets within a scoped multi-line value do not break up the value', function () {
  //   assert({ scope: { key: 'value\ntext\n* value\nmore text' } });
  // });
});

describe('objects_nested', function () {
  test('1. object keys beginning with {.dots} create nested objects', function () {
    assert({ obj: { subobj: { key: 'value' } } });
  });

  test('2. nested objects can themselves contain nested objects', function () {
    assert({ obj: { subobj: { subsubobj: { subsubsubobj: {} } } } });
  });

  test.skip('3. nested objects can contain multiple complex values', function () {
    assert({
      obj: {
        subobj: {
          key: 'value',
          subarray: [{ key: 'value', key2: 'value2', subsubobj: {} }],
        },
      },
    });
  });

  test('4. objects can be closed to return to the parent level', function () {
    assert({
      obj: {
        parentkey: 'value',
        subobj: {
          subkey: 'value',
          subsubobj: { subsubkey: 'value' },
          subkey2: 'value',
        },
        parentkey2: 'value',
      },
    });
  });

  test('5. nested objects do not affect parent arrays keeping track of the item delimiter key', function () {
    assert({
      array: [
        { delimiter: 'value', obj: { key: 'value' } },
        { delimiter: 'value', obj: { key: 'value' } },
      ],
    });
  });

  test('6. nested objects can serve as the item delimiter key', function () {
    assert({
      array: [{ delimiter: { key: 'value' } }, { delimiter: { key: 'value' } }],
    });
  });

  test('7. nested objects act as top-level objects when not already inside an object', function () {
    assert({ subobj: { key: 'value' } });
  });
});

describe('scopes', function () {
  test('1. {scope} creates an empty object at scope', function () {
    assert({ scope: {} });
  });

  test('7. items before a {scope} are not namespaced', function () {
    assert({ key: 'value', scope: {} });
  });

  test('8. items after a {scope} are namespaced', function () {
    assert({ scope: { key: 'value' } });
  });

  test('9. scopes can be nested using dot-notaion', function () {
    assert({ scope: { scope: { key: 'value' } } });
  });

  test('10. scopes can be reopened', function () {
    assert({ scope: { key: 'value', other: 'value' } });
  });

  test('11. scopes do not overwrite existing values', function () {
    assert({
      scope: { scope: { key: 'value' }, otherscope: { key: 'value' } },
    });
  });

  test('12. {} closes the current scope', function () {
    assert({ scope: {}, key: 'value' });
  });

  test('17. key can later be overwriten to become a namespace', function () {
    assert({ key: { subkey: 'subvalue' } });
  });

  test('18. {} resets to the global scope', function () {
    assert({
      scope1: { key1: 'value1' },
      scope2: { key2: 'value2' },
      key: 'value',
    });
  });
});

describe('skip', function () {
  test('13. ignores keys within a skip block', function () {
    assert({ key1: 'value1', key2: 'value2' });
  });
});

describe('unicode', function () {
  test('1. Arbitrary Unicode is allowed in keys', function () {
    assert({ π: '3.14159', 你好: '你好世界', '🐶🐮': 'dogcow' });
  });

  test('2. Arbitrary Unicode is allowed in keys for scopes', function () {
    assert({ π: { value: '3.14159', name: 'Pi' } });
  });

  test('3. Arbitrary Unicode is allowed in keys for arrays', function () {
    assert({ π: [{ value: '3.14159', name: 'Pi' }] });
  });

  test('4. Arbitrary Unicode can be used along with dot-notation', function () {
    assert({ '🐶': { '🐮': 'cow' } });
  });

  test('5. Arbitrary Unicode can be used along with freeform arrays', function () {
    assert({ '🐮': [{ type: 'text', value: 'This text belongs to a cow.' }] });
  });
});

describe('values', function () {
  test('8. keys are case-sensitive', function () {
    assert({ key: 'value', Key: 'Value' });
  });

  test('10. HTML is allowed in values', function () {
    assert({ key: '<strong>value</strong>' });
  });
});
