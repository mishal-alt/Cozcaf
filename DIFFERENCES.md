# The opening page

The opening page was redesigned after the first sign-off. The original cup / bean scene (a pixel-exact port of the approved prototype) is gone, and so is the comparison harness that checked it.

- **Scene:** a fried-chicken bucket (recoloured white, logo in moss green), spicy arrabbiata pasta, cheesy loaded fries and a latte, cut out from the client's own photos and lit into a generated moss and walnut set. Steam, glints, a travelling light and dust are drawn live (`src/hero/scene.ts`).
- **Heading:** the COZCAF lettering is the header's logo. At the top of the page it is lifted into a big centred heading; on the first scroll it glides into the header and the bean mark fades in (`src/hero/page.ts`). There is no second logo.
- **Kept from the old design:** header with nav and Find us, tagline, rotating badge, open-now chip, the left and right copy on desktop, and the cream ticker.
- **Phones:** lighter render path (no grade/bloom/grain passes, about 30 frames a second, lower resolution) and no side copy.
- **Reduced motion:** one finished frame, and the heading jumps instead of gliding.
- **Not available:** the sound toggle, Skip and Replay of the old intro.
