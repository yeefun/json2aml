function toAml(object = {}, { shouldReturnWarnings = false } = {}) {
  const firstArrayInOutermostKey = {
    wasIterated: false,
    wasSet: false,
  };
  const warnings = [];

  function build(root = {}, parent, nestedKeys = [], isFreeformType = false) {
    if (isLiteral(root)) {
      if (!isString(root)) {
        const message = `[json2aml warn]: ArchieML always stores values in the output as strings. A ${capitalize(
          typeof root
        )} ${root} is converted to a String "${String(root)}".`;
        console.warn(message);
        warnings.push(message);
      }

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
      if (isArray(parent)) {
        throw new TypeError(
          `[json2aml error] ArchieML does not support array of arrays: ${JSON.stringify(
            [root]
          )}.`
        );
      }

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
        if (isObject(elem) && checkFreeformType(elem.value)) {
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
        return result;
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

  if (shouldReturnWarnings) {
    return [build(object), warnings];
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

function isString(elem) {
  return typeof elem === 'string';
}

function isLiteral(elem) {
  return !isObject(elem) && !isArray(elem);
}

function isEmptyObject(elem) {
  return isObject(elem) && Object.keys(elem).length <= 0;
}

function capitalize(str = '') {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export default toAml;
