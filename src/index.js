import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/theme/material-darker.css';
import { parse as json5_parse } from 'json5';
import clipboardCopy from 'clipboard-copy';

import './index.css';
import toAml from './to-aml.js';

const STORAGE_KEY = 'jsonToAml';

registerJsonLinter();
const jsonEditorValue = getJsonEditorValueFromStorage();
const [jsonEditor, amlEditor] = initEditors(jsonEditorValue);
listenJsonEditorChange();
setValueToAmlEditor();
handleCopyAml();
handleToggleTheme();

function registerJsonLinter() {
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
}

function initEditors(jsonEditorValue) {
  const { keyMap } = CodeMirror;
  const isMac = keyMap.default == keyMap.macDefault;
  const commentKey = isMac ? 'Cmd-/' : 'Ctrl-/';

  const jsonEditor = CodeMirror(document.getElementById('json-editor'), {
    mode: 'application/json',
    value:
      jsonEditorValue ||
      `{\n\tkey: 'value',\n\tobject: {\n\t\tkey: 'value',\n\t\tsubObject: {},\n\t\tarray: [\n\t\t\t{\n\t\t\t\tsubArray: []\n\t\t\t}\n\t\t]\n\t},\n\tarrayOfStrings: [\n\t\t'value1',\n\t\t'value2'\n\t],\n\tarrayOfObjects: [\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t},\n\t\t{\n\t\t\tkey1: 'value1',\n\t\t\tkey2: 'value2'\n\t\t}\n\t],\n\tfreeformArray: [\n\t\t{\n\t\t\ttype: 'name',\n\t\t\tvalue: 'value1'\n\t\t},\n\t\t{\n\t\t\ttype: 'text',\n\t\t\tvalue: 'value2'\n\t\t}\n\t]\n}\n`,
    tabSize: 2,
    indentWithTabs: true,
    lineNumbers: true,
    autoCloseBrackets: true,
    foldGutter: true,
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
    extraKeys: {
      [commentKey](cm) {
        cm.toggleComment({
          indent: true,
          blockCommentStart: '/*',
          blockCommentEnd: '*/',
          blockCommentContinue: ' * ',
          lineComment: '//',
        });
      },
    },
    lint: {
      getAnnotations: CodeMirror.lint.json,
    },
  });
  const amlEditor = CodeMirror(document.getElementById('aml-editor'), {
    lineNumbers: true,
    readOnly: true,
  });

  return [jsonEditor, amlEditor];
}

function listenJsonEditorChange() {
  jsonEditor.on('change', function handleChange() {
    setValueToAmlEditor();
    saveJsonEditorValueToStorage(jsonEditor.getValue());
  });
}

function setValueToAmlEditor() {
  try {
    const object = json5_parse(jsonEditor.getValue());
    amlEditor.setValue(toAml(object));
  } catch {
    amlEditor.setValue('');
  }
}

function handleCopyAml() {
  const copyBtn = document.getElementById('copy');
  copyBtn.addEventListener('click', function copyAml() {
    clipboardCopy(amlEditor.getValue());
  });
}

function handleToggleTheme() {
  const themeBtn = document.getElementById('theme');
  themeBtn.addEventListener('click', function toggleTheme() {
    const { dataset } = document.documentElement;
    const isDarkTheme = dataset.theme === 'dark';
    dataset.theme = isDarkTheme ? 'light' : 'dark';
    [jsonEditor, amlEditor].forEach(function setTheme(editor) {
      editor.setOption('theme', isDarkTheme ? 'material-darker' : 'default');
    });
  });
}

function getJsonEditorValueFromStorage() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function saveJsonEditorValueToStorage(str = '') {
  try {
    window.localStorage.setItem(STORAGE_KEY, str);
  } catch (err) {
    console.error(err);
  }
}
