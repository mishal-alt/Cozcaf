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

- **Opening hours:** every day 1 PM to 1 AM, confirmed by the client (this drives the live "Open now / Closed" chip and the structured data).
- **Instagram:** `@coz__caf` (`https://www.instagram.com/coz__caf/`), confirmed by the client.
- **Established year:** "Est. 2021" in the hero line.
- **Menu:** dishes in `src/data/menu.ts` come from the client PDF. Prices are not stored or shown (as in the approved design); dietary marks (V / VG / Spicy) can be added if wanted.
- **Menu wording:** dish names follow the PDF; descriptions the PDF lacked were written for the layout, so ask the client to review them.

## Optional

- Email address (shown in the footer), parking note, price range (e.g. "₹₹"), Google rating + review count + link (shown only when all three are real), a Google Maps "Embed" URL for a live map above the link card.

## Photography

The photos in `public/img` are the prototype's. Please supply real, licensed photos of the cafe (bar, food, drinks, exterior, gift boxes), ideally 2000 px on the long side. They are resized and converted to AVIF / WebP / JPEG; keep the same names to replace one.
The social share image `public/og.jpg` (1200 x 630) should be reviewed too.

## To make it feel more premium (please ask the client)

- **Veg / non-veg marks:** the menu shows them only where the PDF is clear (chicken dishes, "Veg or Non-Veg" dishes). Please confirm the coffees, faloodas, fruit salad and Classic Spaghetti so every dish can carry its mark (`diet` in `src/data/menu.ts`).
- **Prices** (or at least "from ₹…") for the menu, if the client wants them shown.
- **Google rating + 2–3 short real reviews** for a reviews strip (never invented).
- **A high-resolution evening photo of the cafe under the fairy lights** (2000 px+) for the Visit section, which says "Evenings under the fairy lights".
- **A real photoshoot of the three signatures** (Rose Latte, Piccolo, Alfredo) to match the rest of the real photos.
- **A photo of the take-home beans / gift boxes** (mentioned in Our Craft) so they can get their own card.
