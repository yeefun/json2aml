function toAml(object = {}) {
  const firstArrayInOutermostKey = {
    wasIterated: false,
    wasSet: false,
  };

  function build(root = {}, parent, nestedKeys = [], isFreeformType = false) {
    if (isLiteral(root)) {
      if (isArray(parent)) {
        return {
          tag: 'string',
          output: `* ${root}\n`,
        };
      } else {
        return {
          tag: 'string',
          output: `${nestedKeys.join('.')}: ${root}\n`,
        };
      }
    }

    if (isArray(root)) {
      let result = '';
      const isFreeformType = checkFreeformType(root);

      let isFirstArrayInOutermostKey = false;
      if (
        firstArrayInOutermostKey.wasIterated &&
        !firstArrayInOutermostKey.wasSet
      ) {
        isFirstArrayInOutermostKey = true;
        firstArrayInOutermostKey.wasSet = true;
      }

      for (const elem of root) {
        let output;
        if (checkFreeformType(elem.value)) {
          ({ output } = build(elem, root, [elem.type], isFreeformType));
        } else {
          ({ output } = build(elem, root, [], isFreeformType));
        }
        result += output;
      }

      const dot = isFirstArrayInOutermostKey ? '' : '.';
      if (!isFreeformType) {
        if (nestedKeys.length > 0) {
          result = `[${dot}${nestedKeys.join('.')}]\n${result}`;
        }
      } else {
        result = `[${dot}+${nestedKeys.join('.')}]\n${result}`;
      }

      return {
        tag: 'array',
        output: result,
      };
    }

    if (isObject(root)) {
      if (isFreeformType) {
        if (root.type === 'text') {
          return { tag: 'string', output: `${root.value}\n` };
        }

        let result = '';

        if (isLiteral(root.value)) {
          result += `${root.type}: ${root.value}\n`;
        } else {
          const isValueArray = isArray(root.value);

          if (isValueArray) {
            if (!checkFreeformType(root.value)) {
              result += `[.${root.type}]\n`;
            }
          } else {
            result += `{.${root.type}}\n`;
          }

          if (!isEmptyObject(root.value)) {
            const { output } = build(root.value, root, nestedKeys);
            result += output;
          }

          if (isValueArray) {
            result += '[]\n';
          } else {
            result += '{}\n';
          }
        }

        return { tag: 'string', output: result };
      }

      let result = '';

      for (const key in root) {
        const value = root[key];
        let tag = '';
        let output = '';
        if (isArray(parent)) {
          ({ tag, output } = build(value, root, [key]));
        } else {
          if (isArray(value)) {
            firstArrayInOutermostKey.wasIterated = true;
          }
          ({ tag, output } = build(value, root, [...nestedKeys, key]));

          firstArrayInOutermostKey.wasIterated = false;
          firstArrayInOutermostKey.wasSet = false;
        }
        result += output;

        if (tag === 'array') {
          result += '[]\n';
        }
      }

      if (!parent) {
        return result !== '' ? result : '{}';
      }

      if (isEmptyObject(root)) {
        return {
          tag: 'string',
          output: `{${nestedKeys.join('.')}}\n${result}{}\n`,
        };
      }

      return {
        tag: 'string',
        output: result,
      };
    }
  }

  return build(object);
}

function checkFreeformType(elem = []) {
  return (
    isArray(elem) &&
    elem.length > 0 &&
    elem.every(function (item = {}) {
      if (!isObject(item)) {
        return false;
      }

      return (
        Object.prototype.hasOwnProperty.call(item, 'type') &&
        Object.prototype.hasOwnProperty.call(item, 'value') &&
        Object.keys(item).length === 2
      );
    })
  );
}

function isObject(elem) {
  return typeof elem === 'object' && !isArray(elem) && elem !== null;
}

function isArray(elem) {
  return Array.isArray(elem);
}

function isLiteral(elem) {
  return !isObject(elem) && !isArray(elem);
}

function isEmptyObject(elem) {
  return isObject(elem) && Object.keys(elem).length <= 0;
}

export default toAml;
