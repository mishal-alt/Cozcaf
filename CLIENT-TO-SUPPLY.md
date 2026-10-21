# Content still needed from the client

Until each item below is supplied, the part of the page that depends on it is hidden (never shown as a fake value).
All of them are filled in `src/data/site.ts` unless noted.

## Needed to switch features on

| Item | Where it shows | What happens until supplied |
| --- | --- | --- |
| **WhatsApp number** (country code + number, digits only) | header "Order" button, menu, visit card, footer | all WhatsApp buttons hidden; header shows "Find us" |
| **Phone number** | "Call us" in the visit card and footer, structured data | no tap-to-call line |
| **Menu PDF** (a link to the file) | "Download full menu (PDF)" under the menu | button hidden |
| **Final address and exact Google Maps place link** (Share, Copy link) | all "Get directions" and map links | currently a Maps search for "COZCAF Kodappali Parappanangadi" |
| **Map pin coordinates** (lat / lng) | structured data (`geo`) | left out |
| **Live domain** | canonical, Open Graph, sitemap, robots, JSON-LD | placeholder `https://cozcaf.example` |

## Please confirm

- **Opening hours:** currently every day 8 AM to 11 PM (this drives the live "Open now / Closed" chip and the structured data).
- **Instagram:** `@coz_caf` (`https://www.instagram.com/coz_caf/`), taken from the shared design.
- **Established year:** "Est. 2021" in the hero line.
- **Menu prices:** every price in `src/data/menu.ts` is a placeholder. The page does not print prices (as in the approved design); send the real list, and dietary marks (V / VG / Spicy) if wanted.
- **Menu wording:** the dish names and descriptions are placeholders written for the layout.

## Optional

- Email address (shown in the footer), parking note, price range (e.g. "₹₹"), Google rating + review count + link (shown only when all three are real), a Google Maps "Embed" URL for a live map above the link card.

## Photography

The photos in `public/img` are the prototype's. Please supply real, licensed photos of the cafe (bar, food, drinks, exterior, gift boxes), ideally 2000 px on the long side. They are resized and converted to AVIF / WebP / JPEG; keep the same names to replace one.
The social share image `public/og.jpg` (1200 x 630) should be reviewed too.
