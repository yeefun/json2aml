import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/lint.css';
import { parse as json5Parse } from 'json5';
import clipboardCopy from 'clipboard-copy';

import './index.css';
import toAml from './to-aml.js';

CodeMirror.registerHelper('lint', 'json', function lintJson(text) {
  const found = [];

  try {
    const object = json5Parse(text);
    toAml(object);
  } catch (err) {
    console.error(err);
    found.push({
      from: CodeMirror.Pos(0, 0),
      to: CodeMirror.Pos(0, 0),
      message: `${err.name}: ${err.message}`,
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
    const object = json5Parse(jsonEditor.getValue());
    amlEditor.setValue(toAml(object));
  } catch {
    amlEditor.setValue('');
  }
}

const copyBtn = document.getElementById('copy');
copyBtn.addEventListener('click', function handleClick() {
  clipboardCopy(amlEditor.getValue());
});
