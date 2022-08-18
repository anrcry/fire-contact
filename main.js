import './src/style.css';
import { loadScript, showSnackbar } from './src/util';
import { auth, signInAnonymously, onAuthStateChanged, createRecord } from './src/firebase';
import { verifyToken } from './src/verify';
import Snackbar from "node-snackbar";
import sha1 from 'js-sha1';
// import Filter from 'bad-words';

const { PUBLIC_RECAPTCHA_SITE_KEY, PUBLIC_RECAPTCHA_SITE_THEME, PUBLIC_RECAPTCHA_SITE_SIZE } = import.meta.env;

const validationToggleClass = 'validation-complete';
window.submission = false;

const captcha = {
    div: 'recaptcha',
    widget: null,
    errorCallback: () => {
        window.alert("Sorry! There is some error while loading the captcha!")
    },
    loaded: false,
    opts: Object.freeze({
        'sitekey' : PUBLIC_RECAPTCHA_SITE_KEY,
        'theme': PUBLIC_RECAPTCHA_SITE_THEME,
        'size': PUBLIC_RECAPTCHA_SITE_SIZE,
        'error-callback': 'recaptchErrorOnLoad',
        'expired-callback': 'recaptchTokenExpired'
    })
};

// Recaptcha handler.
window.recaptchaLoaded = () => { 
    captcha.loaded = true
    document.querySelector("#recaptcha-loading").style.display = "none";
    
    window.recaptchaQueue.forEach( (elem) => {
        const { cb } = elem;

        if(typeof cb === 'function'){
            cb();
        }

    });

    window.recaptchaQueue = [];
}

window.recaptchErrorOnLoad = () => {
    // We need to close the modal...
    // TODO: Vanilla JS
    $('#contact_form').modal('hide');
    
    document.querySelector('#recaptcha-container').classList.add('validation-complete');
    document.querySelector("#contact_form_toggle").disabled = true;

    showSnackbar( {
        text: "🛡 There was some error while trying to load the recaptcha. We will automatically reload this page in 5 seconds. Sorry for the inconvinience 🙏!",
        duration: 5000,
        fontSize: '16px',
        pos: 'top-right',
        showAction: false,
        onClose: () => {
            window.location.reload();
        }
    });
}

window.recaptchTokenExpired = () => {
    if(!window.submission) return;

    document.querySelector('#recaptcha-container').classList.remove('validation-complete');
    document.querySelector("#recaptcha-loading").style.display = "inner-block";

    showSnackbar( {
        text: "The captcha token has expired 😞. We are fetching a new one for you 📥. Please solve & submit again.",
        duration: 5000,
        fontSize: '16px',
        pos: 'bottom-left',
        showAction: false,
        onClose: () => {
            document.querySelector("#recaptcha-loading").style.display = "none";
            document.querySelector('#recaptcha-container').classList.add('validation-complete');
            if(captcha.loaded) grecaptcha.reset(captcha.widget);
        }
    });
    
}

document.querySelector("#contact_form_toggle").addEventListener('click', (evt) => {
    if(evt.target.disabled) return;
    $('#contact_form').modal('show');
});


// A queue to hold any items while recaptcha is loading.. It is executed just after the recaptcha is loaded...
window.recaptchaQueue = [];

// All the inputs which are provided..
const inputs = Object.freeze({
    name: {
        el: document.querySelector("#fullName"),
        reset: () => { document.querySelector("#fullName").value = "" },
        getText: () => { return document.querySelector("#fullName").value },
        required: true
    },
    email: {
        el: document.querySelector("#email"),
        reset: () => { document.querySelector("#email").value = "" },
        getText: () => { return document.querySelector("#email").value },
        validation: '',
        required: true
    },
    subject: {
        el: document.querySelector("#subject"),
        reset: () => { document.querySelector("#subject").value = "" },
        getText: () => { return document.querySelector("#subject").value },
        required: true
    },
    message: {
        el: document.querySelector("#standalone-container"),
        reset: () => { document.querySelector("#standalone-container").value = "" },
        getText: () => { return document.querySelector("#standalone-container").value },
        required: true
    }
});

const form_1 = document.querySelector("#form-1");

const removeError = (elem, cname="invalid-feedback", removeFromEl = false, celname = 'is-invalid') => {
    const { el } = elem;
    
    const holder = document.querySelector(el.dataset.error);

    if([...holder.classList].includes(cname))
        holder.classList.remove(cname);

    if(removeFromEl && [...el.classList].includes(celname)){
        el.classList.remove(celname)
    }
}

const addError = (elem, text, cname="invalid-feedback", celname = 'is-invalid') => {
    if(text === null || typeof text !== "string" || text.length == 0){
        throw Error ("The text to display is invalid");
    }
    const { el } = elem;
    el.classList.add(celname);
    const holder = document.querySelector(el.dataset.error);
    holder.innerText = text;
    holder.classList.add(cname);

    return elem;
}

const formData = Object.freeze({
    email: {
        value: null
    },
    name: {
        value: null
    },
    subject: {
        value: null
    },
    message: {
        value: null
    }
});

let toggle = {
    disableInputs: [],
    validationToggle: [],
};

document.querySelector("#next").addEventListener("click", (e) => {
    // So this should submit the form_1
    let error = false;
    const {name, email, subject, message} = inputs;
    // Queue to remove the error blocks...
    const queue = [];

    // Check
    if(name.el === null || name.getText().length == 0){
        error = true;
        queue.push(addError(name, "Name is required!"));
    }

    if(typeof email.el.checkValidity !== 'function') {
        email.el.checkValidity = function(){
            /\S+@\S+\.\S+/.test(this.value);
        }
    }

    if(email.el === null || email.getText().length == 0 || email.el.checkValidity() == false){
        error = true;
        queue.push(addError(email, email.getText().length === 0 ? "Email Address is required." : "Email Address is invalid!"));
    }

    if(subject.el === null || subject.getText().length == 0){
        error = true;
        queue.push(addError(subject, "Subject is required!"));
    }

    if(message.el === null || message.getText().length == 0){
        error = true;
        queue.push(addError(message, "Message is required!"));
    }
    
    if(error){
        // Show the error snackbar
        showSnackbar( {
            text: `🤨 There were some errors! Please try again`,
            duration: 10000,
            fontSize: '16px',
            pos: 'top-right',
            showAction: false,
            onClose: () => {
                if(queue.length > 0) queue.forEach(element => removeError(element));
            }
        })

        return;
    }

    // Record all the values;
    const {email: fEmail, name: fName, subject: fSubject, message: fMessage} = formData;
    fEmail.value = email.getText();
    fName.value = name.getText();
    fSubject.value = subject.getText();
    fMessage.value = message.getText();

    // Check all the modes...
    const { retain, button, dispose } = { retain: document.querySelector(e.target.dataset['retain']), button: document.querySelector(e.target.dataset['button']), dispose: document.querySelector(e.target.dataset['dispose']) }

    // record all stuff
    toggle = {
        // All the stuff which gets disabled...
        disableInputs: [name, email, subject, message, {el: e.target}, {el: button}, {el: document.querySelector("#reset_main_form")}],
        // All the toggle...
        validationToggle: [e.target, retain, button, dispose, document.querySelector("#reset_main_form")],
        // All the callback
        callback: [
            {
                cb: () => $("#validation-banner").fadeOut()
            }
        ]
    }
    
    // Local variables
    const {disableInputs, validationToggle} = toggle;

    // Disable the inputs
    disableInputs.forEach(a => a.el.disabled = !a.el.disabled);

    // Toggle all necessary 'validation-classes' for display & state change...
    validationToggle.forEach( el => el.classList.add(validationToggleClass) );

    $("#validation-banner").fadeIn()

    // Now render grecaptcha, after putting flag as true...
    window.submission = true;

    if(captcha.loaded){
        if(captcha.widget === null) {
            captcha.widget = grecaptcha.render(captcha.div, captcha.opts);
        }else{
            grecaptcha.reset(captcha.widget)
        }
    }else{
        submit_btn.disabled = true;
        window.recaptchaQueue = [
            {
                cb: () => { captcha.widget = grecaptcha.render(captcha.div, captcha.opts) }
            }, 
            {
                cb: () => { document.querySelector("#submit_btn").disabled = false }
            }
        ];
    }
});

form_1.addEventListener( 'submit', (e) => {
    e.preventDefault();
});

document.querySelector('#submit_btn').addEventListener('click', async (event) => {

    if(!captcha.loaded || event.target.disabled === true || captcha.widget === null) return;
    event.target.disabled = true;

    if(!window.user) {
        showSnackbar( {
            text: "😿 Sorry there is error. Kindly please reload the page (Psst.. we will do it for you).",
            duration: 5000,
            pos: 'top-left',
            fontSize: '16px',
            showAction: false,
            onActionClick: null,
            onClose: () => {
                window.location.reload();
            }
        });
    }

    showSnackbar({
        text: `<i class="fas fa-spinner-third fa-spin" style="font-size: 22px !important;"></i>&nbsp;Verifying your message!`,
        duration: 0,
        fontSize: '22px',
        pos: 'top-right',
        showAction: false,
    })

    const token = grecaptcha.getResponse(captcha.widget);

    if(token.length === 0){
        // Do something
        showSnackbar( {
            text: "You are required to complete the challenge 💪🏻 to prove that you are not a robot 🤖",
            duration: 2000,
            fontSize: '16px',
            pos: 'top-right',
            showAction: true,
            onClose: null,
            onActionClick: () => { Snackbar.close() }
        })
        return;
    }

    try {
        var { success, message: text, hostname=null } = await verifyToken(token);
    }catch (err) {
        var { success, text } = { success: false, text: "😓 There was some errors while verifying... Please try again!" }
    }
    
    if(!success){
        showSnackbar({
            text,
            duration: 5000,
            fontSize: '16px',
            pos: 'top-right',
            showAction: false,
        })

        if(captcha.loaded && captcha.widget !== null){
            // No captcha no reseting....
            grecaptcha.reset(captcha.widget)
        }
        event.target.disabled = false;
        return;
    }

    // Find the sha-1 of the same token...
    const uid = { value: (window.user.uid) }
    const {email, name, subject, message, token:hToken } = {...formData, token: { value: sha1(token) } };

    showSnackbar({
        text: `<i class="fas fa-spinner-third fa-spin" style="font-size: 22px !important;"></i>&nbsp;Processing your message!`,
        duration: 0,
        fontSize: '22px',
        pos: 'top-right',
        showAction: false,
    })

    // Only recording the message is left... that's it...
    
    const resp = Object.freeze({
        uid: uid.value, 
        email: email.value, 
        name: name.value, 
        subject: subject.value, 
        message: message.value, 
        token: hToken.value,
        hostname 
    })
    
    const snackClose = false

    try {

        const { record, success, err=null } = await createRecord( { ...resp } );

        if(!success || !'id' in record || record.id === null){
            console.error(err);
            throw err ?? new Error(`There was some error`);
        }

        $('#contact_form').modal('toggle');
        event.target.disabled = false;
        
        /** 
         * ✅ Clear the form data
         * ✅ Enable items
         * ✅ Toggle Callback (yes)
         * ✅ Toggle the disabled & validation
         * ✅ Return the disabled & validation
         * 😑 Reset the captcha (Compulsory)
         * ✅ Toggle the submission global field
         * ✅ Reset all items
         * ❎ Snackbar closing
         */
        allReset({ snackClose });
        
        showSnackbar({
            text: "Horray 🥳! I have recieved your message 📩! We will soon be in contact 🤙!",
            duration: 30000,
            fontSize: '16px',
            pos: 'top-right',
            showAction: true,
            actionText: '👍🏻',
            actionTextAria: 'Okay thanks!',
            onActionClick: () => {
                if(Snackbar.current) Snackbar.close()
            }
        })

    } catch (err) {
        console.error(err);
        /** 
         * ✅ Clear the form data
         * ✅ Enable items
         * ✅ Toggle Callback (yes)
         * ✅ Toggle the disabled & validation
         * ✅ Return the disabled & validation
         * 😑 Reset the captcha (Compulsory)
         * ✅ Toggle the submission global field
         * ❎ Reset all items (so that they can try again)
         * ❎ Snackbar closing
         */
        const elementReset = false;
        event.target.disabled = elementReset;
        allReset({ snackClose, elementReset });

        showSnackbar({
            text: "Thank you for your message. 😞 Something went wrong and your message could not be recorded. I would like to apologize 🙏🏼!",
            duration: 20000,
            fontSize: '16px',
            pos: 'top-right',
            showAction: true,
            actionText: '🆗',
            actionTextAria: 'Ok',
            onActionClick: () => {
                if(Snackbar.current) Snackbar.close()
            }
        });
    }   
});


const allReset = ( { clearFormData=true, snackClose=true, toggleDisabled=true, returnDisable=false, toggleValidation=true, returnValidation=false, toggleSubmission=true, elementReset=true, elementResetQueue=false, toggleCallback=true } ) => {
    // Dismiss the snackbar
    if(snackClose && Snackbar.current) Snackbar.close()
    
    // Same reset function...
    
    const { name, email, subject, message } = inputs;
    const queue = [name, email, subject, message];
    // Element has been reset.
    if(elementReset) queue.forEach(element => element.reset())
    
    // Check global submission.
    // If flag is not set do not go beyond.
    if(!window.submission) return;


    // Now lets do the reset of the stuff, where we toggle all the others...

    const { disableInputs, validationToggle, callback } = toggle;

    // Disable the inputs
    if(toggleDisabled) disableInputs.forEach(a => a.el.disabled = !a.el.disabled);
    
    if(toggleValidation) { 
        validationToggle.forEach( el => {
            if([...el.classList].includes(validationToggleClass))
                el.classList.remove(validationToggleClass)
        });
    }

    // Check the grecaptcha widget & reset it...
    if(captcha.loaded && captcha.widget !== null){
        // No captcha no reseting....
        grecaptcha.reset(captcha.widget)
    }

    // Purged the full form data.
    if(clearFormData) Object.keys(formData).forEach( (key) => formData[key].value = "");

    Object.keys(toggle).forEach( (key) => toggle[key] = null );

    if(toggleCallback)
        callback.forEach( async (func, idx) => { 
            if('cb' in func && typeof func['cb'] === 'function') {
                const { cb, isAsync=false } = func;
                try {
                    if(isAsync) {
                        await cb();
                    }else{
                        cb();
                    }
                }catch (err) {
                    console.error(`${err}: Encountered at ${idx}!`)
                }
            }
        })

    // Toggle has been set...
    toggle = {
        disableInputs: toggleDisabled ? [] : disableInputs,
        validationToggle: toggleValidation ? [] : validationToggle,
        callback: toggleCallback ? [] : callback,
    }

    if(toggleSubmission) window.submission = false;

    document.querySelector("#recaptcha-loading").style.display = "inner-block";

    const back = {};

    if(elementResetQueue) back['elementQueue'] = queue;
    if(returnValidation) back['validationToggle'] = validationToggle
    if(returnDisable) back['disableInputs'] =  disableInputs
    
}

document.querySelector("#reset_main_form").addEventListener('click', (e) => {
    if(!e.target.disabled) allReset({});
});

document.querySelector('#contact_form_close').addEventListener('click', function (e) {
    if(!e.target.disabled){
        allReset({});
        $('#contact_form').modal('toggle');
    }
});

$('#contact_form').on('shown.bs.modal', async () => {
    // We will now load the grecaptcha...
    if(!captcha.loaded) loadScript("https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit");

    document.querySelector("#contact_form_toggle").disabled = true;

    // We will anonymously sign in you..
    if(!('user' in window) || window.user === null){
        try {
            const result = await signInAnonymously(auth);
            const { user } = result;
            window.user = user;
        }catch(err){
            console.error(err)
        }
    }
})

$('#contact_form').on('hidden.bs.modal', () => { 
    document.querySelector("#contact_form_toggle").disabled = !true;
})

onAuthStateChanged(auth, (user) => {
    if( user ){
        window.user = user;
    }else {
        // You are signed out... So we will sign out...
    }
});