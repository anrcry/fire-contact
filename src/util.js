import 'node-snackbar/dist/snackbar.min.css';
import Snackbar from "node-snackbar";

const loadScript = function(src, callback = null, defer = true, async = true) {
    const script = document.createElement('script');
    script.defer = defer;
    script.async = async;

    // No support for IE < 9

    if(callback !== null && typeof callback === "function"){
        script.onload = function() {
            callback();
        };
    }

    script.src = src;

    document.body.appendChild(script);
}

const showSnackbar = function(opts) {
    const { fontSize } = opts;

    if(typeof fontSize === "string"){
        delete opts.fontSize;
    }

    Snackbar.show({
        textColor: '#FFFFFF',
        text: 'Hi!',
        duration: parseInt(import.meta.env.PUBLIC_SNACKBAR_DEFAULT_TIME),
        pos: 'bottom-left',
        showAction: true,
        actionText:	'Dismiss',
        onActionClick: null,
        onClose: null,
        customClass: 'bold',
        backgroundColor: '#000000',
        ...opts  
    });

    if(typeof fontSize === 'string') [...Snackbar.current.children].forEach( e => e.style['font-size'] = fontSize );
}

export {
    loadScript,
    showSnackbar
}