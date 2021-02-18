import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closebrackets.js';
import { parse as json5Parse } from 'json5';
import clipboardCopy from 'clipboard-copy';

import './index.css';
import toAml from './to-aml.js';

const jsonEditor = CodeMirror(document.getElementById('json-editor'), {
  mode: { name: 'javascript', json: true },
  value: `{\n\tkey: 'value',\n\tobject: {\n\t\tkey: 'value',\n\t\tsubObject: {},\n\t\tarray: [\n\t\t\t{\n\t\t\t\tsubArray: []\n\t\t\t}\n\t\t]\n\t},\n\tarrayOfStrings: [\n\t\t'value1',\n\t\t'value2'\n\t],\n\tarrayOfObjects: [\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t},\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t}\n\t],\n\tfreeformArray: [\n\t\t{\n\t\t\ttype: 'name',\n\t\t\tvalue: 'value1'\n\t\t},\n\t\t{\n\t\t\ttype: 'text',\n\t\t\tvalue: 'value2'\n\t\t}\n\t]\n}\n`,
  tabSize: 2,
  indentWithTabs: true,
  lineNumbers: true,
  autoCloseBrackets: true,
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
  const object = json5Parse(jsonEditor.getValue());
  amlEditor.setValue(toAml(object));
}

const copyBtn = document.getElementById('copy');
copyBtn.addEventListener('click', function handleClick() {
  clipboardCopy(amlEditor.getValue());
});