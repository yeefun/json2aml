import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/lint.css';
import { parse as json5_parse } from 'json5';
import clipboardCopy from 'clipboard-copy';

import './index.css';
import toAml from './to-aml.js';

CodeMirror.registerHelper('lint', 'json', function lintJson(text) {
  const found = [];
  const beginning = CodeMirror.Pos(0, 0);

  try {
    const object = json5_parse(text);
    const [, warnings] = toAml(object, { shouldReturnWarnings: true });
    found.push(
      ...warnings.map(function buildProblem(message) {
        return {
          from: beginning,
          to: beginning,
          severity: 'warning',
          message,
        };
      })
    );
  } catch (err) {
    console.error(err);

    const message = err.message.replace(/^JSON5:/, '[JSON5 error]');
    found.push({
      from: beginning,
      to: beginning,
      message,
    });
  }

  return found;
});

const jsonEditor = CodeMirror(document.getElementById('json-editor'), {
  mode: { name: 'javascript', json: true },
  value: `{\n\tkey: 'value',\n\tobject: {\n\t\tkey: 'value',\n\t\tsubObject: {},\n\t\tarray: [\n\t\t\t{\n\t\t\t\tsubArray: []\n\t\t\t}\n\t\t]\n\t},\n\tarrayOfStrings: [\n\t\t'value1',\n\t\t'value2'\n\t],\n\tarrayOfObjects: [\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t},\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t}\n\t],\n\tfreeformArray: [\n\t\t{\n\t\t\ttype: 'name',\n\t\t\tvalue: 'value1'\n\t\t},\n\t\t{\n\t\t\ttype: 'text',\n\t\t\tvalue: 'value2'\n\t\t}\n\t]\n}\n`,
  tabSize: 2,
  indentWithTabs: true,
  lineNumbers: true,
  autoCloseBrackets: true,
  gutters: ['CodeMirror-lint-markers'],
  lint: true,
});
const amlEditor = CodeMirror(document.getElementById('aml-editor'), {
  lineNumbers: true,
  readOnly: true,
  theme: '',
});

jsonEditor.on('change', function handleChange() {
  setAmlEditorValue();
});

setAmlEditorValue();

function setAmlEditorValue() {
  try {
    const object = json5_parse(jsonEditor.getValue());
    amlEditor.setValue(toAml(object));
  } catch {
    amlEditor.setValue('');
  }
}

const copyBtn = document.getElementById('copy');
copyBtn.addEventListener('click', function handleClick() {
  clipboardCopy(amlEditor.getValue());
});
