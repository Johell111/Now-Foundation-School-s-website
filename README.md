# NOW Foundation School website

A complete static multi-page school website built for Creche, Nursery and Primary education.

## Pages

- Home
- Our School
- Creche
- Nursery
- Primary
- Student Life
- School Gallery
- Admissions
- Contact
- 404

## Forms

The existing Formspree endpoint is preserved exactly:

`https://formspree.io/f/mzdayydn`

Both the admission form and general enquiry form submit to that endpoint.

## Run locally

Open `index.html` directly, or serve the folder with any static HTTP server.

## Official media

Official, authorised school photographs are stored as optimised WebP files in `public/media/images/`. Smaller 640 px and 960 px variants support responsive loading. The `schoolMedia` mapping in `assets/js/site.js` assigns descriptive alt text and images to the existing page slots. Empty slots retain a neutral background.

The supplied JPEGs and enhanced PNG masters are preserved in `media-originals/`, which is excluded from Git. Keep this directory outside any direct folder deployment; deploy only the website files and `public/media/`. The original files also remain in their supplied Downloads folder. The `prepare_school_photos.py` script records the source-to-output mapping and can regenerate the optimised WebP files on this computer.

Eight approved school clips are published under `public/media/videos/`, with still-frame WebP posters in `public/media/images/gallery/`. `assets/js/gallery-data.js` is the single list of gallery media and can be updated when new official media arrives. The gallery loads videos only when a visitor selects one. About, Nursery, Primary and Student Life include relevant clips; the homepage retains the school entrance photograph.

The supplied MP4 files are preserved unchanged in `media-originals/videos/`, which is excluded from Git and deployment. Published clips preserve the original AAC audio from each source; no replacement music has been added. `process_school_videos.py` creates the trimmed H.264/AAC MP4 files and their frame posters; `publish_school_videos.py` places them in `public/media/`.

Run `python verify_media_cleanup.py` to check the site media references, responsive photographs, gallery entries, and original-file backups.

## Deployment

The folder can be deployed directly to GitHub Pages, Netlify, Cloudflare Pages, Vercel static hosting, cPanel, or any normal web server.
