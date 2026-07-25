# Anthrolabs

Brand landing page for **Anthrolabs** — premium Korean seaweed (gim) and clean
toothpaste, crafted in Korea and made for the U.S. market.

Static site (HTML/CSS/JS), hosted on **GitHub Pages** at
[theanthrolabs.com](https://theanthrolabs.com).

## Structure

```
index.html      # single-page landing
styles.css      # all styles
script.js       # footer year + waitlist form handling
CNAME           # custom domain for GitHub Pages (theanthrolabs.com)
assets/         # favicon + social share image
```

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Waitlist setup (Formspree — free)

The waitlist form needs a form endpoint to collect emails:

1. Sign up at <https://formspree.io> with your brand email.
2. Create a new form and copy its endpoint ID (e.g. `abcd1234`).
3. In `index.html`, replace `YOUR_FORM_ID` in the form's `action` with it.
4. Commit & push — new signups will arrive in your Formspree inbox / email.

## Deploy

Any push to `main` auto-publishes via GitHub Pages. Give DNS changes a few
minutes to an hour to propagate, then HTTPS is issued automatically.

## To do / swap in later

- Replace placeholder gradient blocks with real product & lifestyle photos.
- Connect the Formspree form ID.
- Add product pages / storefront when moving beyond the landing phase.
