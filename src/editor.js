import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style
// import 'prismjs/themes/prism.css';
// import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import Editor from '@toast-ui/editor';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
// import Prism from 'prismjs';
// import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
// import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
// import uml from '@toast-ui/editor-plugin-uml';

const getBorderColor = (defaultColor=false) => {
    if(defaultColor) return '#dadde6';
    return !window.errorMode ? '#80bdff' : '#dc3545';
}

const getBoxShadow = (defaultColor=false) => {
    if(defaultColor) return 'unset';
    return !window.errorMode ? '0 0 0 0.2rem rgb(0 123 255 / 25%)' : '0 0 0 0.2rem rgb(220 53 69 / 25%)'
}

const el = document.querySelector("#standalone-container");

const opts = Object.freeze({
    previewStyle: el.dataset?.previewStyle || 'tab',
    height: el.dataset?.height || '200px',
    placeholder: el.dataset?.placeholder || 'Write a message',
    initialEditType: el.dataset?.initialEditType || 'wysiwyg',
    autofocus: false,
    plugins: [/*[codeSyntaxHighlight, { highlighter: Prism }], colorSyntax,*/ tableMergedCell, /* uml */],
})

const editor = new Editor({
    el,
    usageStatistics: false,
    ...opts
});

Editor.prototype.setCss = function(el, property, value){
    el.querySelector('.toastui-editor-defaultUI').style[property] = value;
    return this;
}

const setErrorEditorCss = function(el, defaultBorder = false) {
    editor.setCss(el, 'border-color', getBorderColor(defaultBorder));
}

editor.on("focus", () => {
    editor.setCss(el, 'border-color', getBorderColor(false)).setCss(el, 'box-shadow', getBoxShadow(false));
});

editor.on("blur", () => {
    if(window.errorMode) {
        // Remove the box-shadow
        editor.setCss(el, 'box-shadow', getBoxShadow(true));
        return;
    }
    editor.setCss(el, 'border-color', getBorderColor(true)).setCss(el, 'box-shadow', getBoxShadow(true));
})


editor.setCss(el, 'transition', 'box-shadow .15s ease-in-out');

document.querySelector("#standalone-container-label").addEventListener('click', () => {
    editor.focus();
});

export {
    el,
    opts,
    editor,
    setErrorEditorCss,
}