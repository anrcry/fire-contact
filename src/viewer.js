import { opts as editorOpts } from './editor'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

const el = document.querySelector("#standalone-viewer");

const opts = Object.freeze({
    height: el.dataset?.height || editorOpts?.height || '200px',
    plugins: editorOpts?.plugins
});

const viewer = new Viewer({
    el,
    usageStatistics: false,
    ...opts
});

export {
    el,
    viewer
}