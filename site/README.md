# Sen Digitals — Studio Site

Premium, scroll-animated single-page site for Sen Digitals (web design & digital solutions agency).

## Stack
- HTML / CSS / JS — no framework
- GSAP + ScrollTrigger for scroll choreography
- Google Fonts: Cormorant Garamond + Inter
- Mobile-first responsive

## Local preview
Open `index.html` directly, or serve the folder:

```
cd site
python3 -m http.server 8080
```
Then visit http://localhost:8080.

## Deploy
**Vercel:** drag the `site/` folder into vercel.com or `vercel --prod`.
**Netlify:** drag the `site/` folder into app.netlify.com/drop.

No build step required.

## Structure
```
site/
├── index.html
├── css/styles.css
├── js/main.js
└── assets/
    ├── sd-logo-extended.png   # Full lockup
    ├── sd-logo.png            # Mark + cream background
    ├── sd-mark.png            # Square mark (favicon / nav)
    └── finalbg.png
```

## Customizing
- **Colors:** edit `:root` in `css/styles.css`. Gold tokens: `--gold`, `--gold-2`, `--gold-3`.
- **Hero copy:** in `index.html` under `.hero-content`.
- **Case studies:** edit the four `.work-item` blocks in `index.html` to swap real client work.
- **Contact form:** uses `mailto:` by default — wire to Formspree / a custom endpoint by editing `<form action="...">`.

## Nano Banana asset slot
The hero currently shows the gold SD logo. To replace with a 3D render:
- Replace `assets/sd-logo.png` with a 720×720 transparent PNG, or
- Edit `<img class="hero-logo">` in `index.html`.

The placeholder is marked with `<!-- NANO BANANA ASSET HERE -->`.
