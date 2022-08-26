# 🔥 Fire Contact 📧

Fire Contact is built to get messages from you. My [website](https://formula21.github.io) is hosted on [GitHub](https://github.com/formula21/formula21.github.io), which is basically a static site hosting, with no backend. But a website devoid of a contact form is really in-efficient. Again it is arguably easy to shift to a hosting provider in less than a minute. They provide me with a SQL database, a backend to host my files, a custom dashboard so on and forth. But I really like to stick on to GitHub Pages.

Enter [Firebase by Google](https://firebase.google.com) a product which basically is a backend jamstack only better. It can be accessed from the front-end, is lightweight, easy to learn, and packed with a lot of features other than a database. Most importantly it is built by Google, so it must be good right. You may want to argue that, most (if not all) my projects are open source and I am an open-source fan. So why not use [Supabase](https://supabase.com) or any other [alternatives](https://blog.back4app.com/firebase-alternatives/). Honestly, I find this product of Google like many other best suited and quick to learn.

My client side code is bootstraped & built by [Vite.js](https://vitejs.dev) with the `Vanilla JS` flavour.

## Proprietary Third Party Stuff
- 🔥 Google Firebase (code for this is open-source & I have used the [firebase/js-sdk](https://github.com/firebase/firebase-js-sdk))
  - 🔒 Authentication ~ Firebase Anonymous Authentication for tracking
  - 🗺 Google Analytics
  - 🗄 Cloud Firestore
  - ✔ App Check
  - ☁ Cloud Functions (Soon to be implemented)
- Google reCAPTCHA
  - Version 2 _(v2)_ ➡ "✅ I am not a robot"
  - Version 3 _(v3)_ ➡ "🙈 Invisible for App Check"

## Open Source Stuff
- 🤬|❎ [Bad Words Filter](https://github.com/web-mech/badwords)
- #️⃣ [SHA-1](https://github.com/emn178/js-sha1)
- 📢 [Snackbar](https://github.com/polonel/SnackBar)

## Killer features

- 🔥 Blazingly fast
- ⚖ Extremely Lightweight
- ⏳ Realtime features
- 🔐 Standard Verification & Security
-🤺 Battle tested

## Other features

- 🔁 Idempotent Messages (No replay attacks)
- 🛡 Messages sent only by humans (reCAPTCHA token has to be solved & the site is protected via reCAPTCHA 😈)
- 🚦 Protected backend by security rules.
- 📏 Easily scaleable
- ⛔ No read access
- 📉 Low writes & reads keeping the 💳 cost low
- ⏳ Scheduled auto-reply

## Workflow

### Client Side workflow

⌨ | 🧼 `➡` 🖱 `➡` 💪🏻 `➡` 🖱 `➡` 🛡 `➡` 🔥|🗄 `➡` ⏳ `➡` 📩

👆🏻 The above emojis summarize the workflow. It starts with the user typing ⌨ a message. They intially try to check 🕵🏻‍♂️ & filter 🧼 any profanity from the message, while validating the name, email and the subject. After that it challenges 💪🏻 the user 👤 to solve the same. The user then submites the solved challenge, which gets verified 🛡 and at the end a document is written to the Cloud Firestore under the collections "messages" (by default). I deviced a plan to make the message idempotent (no recording/writting) more than once, by making the document id the "hash of the token" solved by the user.

The following is the structure of the document written:

```json
{
  name: "name",
  email: "example@example.com",
   
}
```


## What needs to be changed?
