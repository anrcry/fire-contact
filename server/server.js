require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const ADMIN_PORTAL = "https://www.google.com/recaptcha/admin/";
const VERIFY_DOCS = "https://developers.google.com/recaptcha/docs/verify";
const URL_COMPARE_REGEX = new RegExp(/^(((ht|f)tps?):\/\/)+[\w-]+([localhost]|(\.[\w-]+))+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/);


const PROD = process.env.MODE === "development" ? false : true;

const PORT =
  (typeof process.env?.PORT === "string"
    ? parseInt(process.env?.PORT)
    : null) || 3000;

if (
  !"RECAPTCHA_SITE_KEY" in process.env ||
  process.env.RECAPTCHA_SITE_KEY.length === 0 ||
  !"RECAPTCHA_SECRET_KEY" in process.env ||
  process.env.RECAPTCHA_SECRET_KEY.length === 0
) {
  // Ok we need to prompt
  console.info(
    `The keys required is not set or invalid. Please visit ${ADMIN_PORTAL}`
  );
  process.exit(1);
}

if (
  !"RECAPTCHA_ENDPOINT" in process.env ||
  process.env.RECAPTCHA_ENDPOINT.length === 0 ||
  process.env.RECAPTCHA_ENDPOINT.match(URL_COMPARE_REGEX) === false
) {
  // This won't work
  console.info(
    `The endpoint to verify the token was not configured or misconfigured. Please visit ${VERIFY_DOCS}`
  );
  process.exit(1);
}

const { RECAPTCHA_ENDPOINT, RECAPTCHA_SECRET_KEY } = process.env;

const whitelist = [
  "https://me.anweshan.online",
  "https://app.anweshan.online",
  "https://anweshan-roy-chowdhury.web.app",
  "https://anweshan-roy-chowdhury.firebaseapp.com",
  "https://auth.anweshan.online"
];

if(!PROD) { 
  whitelist.push('http://localhost:5173'); 
  whitelist.push('https://5173-formula21-firecontact-6aa3kmg6qea.ws-us60.gitpod.io');
  whitelist.push('https://3000-formula21-firecontact-6aa3kmg6qea.ws-us60.gitpod.io');
  whitelist.push('http://localhost:3000') 
}

const corsOptions = Object.freeze({
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if (whitelist.includes(origin)) return callback(null, true);
      return callback(`This origin is not allowed!`, false);
  },
});

app.use(cors(corsOptions));

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post("/verify", async (req, res) => {
  // First check if we have the `token` parameter
  const { token = null } = req.body;

  if (token === null || token.length === 0)
    res.status(403).json({ error: true, message: "A token was expected!" });
  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    }).toString();
    
    // console.log(`${RECAPTCHA_ENDPOINT}?${params}`);

    const resp = await axios.post(`${RECAPTCHA_ENDPOINT}?${params}`);

    const { success, hostname = null } = resp.data;

    const message = !success
      ? resp.data["error-codes"][0] === "timeout-or-duplicate"
        ? "The captcha could not be verified!"
        : "An internal server error occured"
      : "OK";

    res.status(success ? 200 : 500).json({ success, message, hostname });
  } catch (err) {
    console.log(`${err} emitted at axios!`);
  }
});

const listener = app.listen(PORT, () =>
  console.log("Your app is listening on port " + listener.address().port)
);