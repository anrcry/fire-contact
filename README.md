# 🔥 Fire Contact 📧

Introducing Fire Contact, a javascript application which helps [me.anweshan.online](https://me.anweshan.online), have a front-end contact form.

The application's stores your message in the [cloud firestore](https://firebase.google.com/docs/firestore) in [Firebase](https://firebase.google.com). Protected by "rules", the front-end JS SDK provided by Firebase is enough to record your messages.

The application is protected from "multiple writes" by forcing the user to solve a CAPTCHA provided by [reCAPTCHA](https://www.google.com/recaptcha/about/).

To verify the validity of the response sent by solving the reCAPTCHA, a server-side mechanism is necessary. This is tackled by exposing an endpoint through [Express.js](https://expressjs.com/) hosted at the moment by [Glitch](https://glitch.com/).
