# Master Contract Mosaic Illusion

This plan details how to implement the "mosaic puzzle" illusion where unsold cells form a giant master contract image, while sold cells retain their individual permanent ads.

## Proposed Changes

### 1. The Global Contract Image
We will load a high-resolution "Contract Ad" image into the canvas. This image will represent the massive billboard that spans the entire website grid.

### 2. Update Cell Renderer (`app/cmps/views/price-overlay/price-overlay.tsx`)
Currently, available cells draw a dark blue background with a cyan grid. We will update the `drawAvailableCard` function to:
- Take the master contract image as a new parameter.
- Calculate the cell's exact position on the screen `(x, y)`.
- Use those coordinates to slice out the exact corresponding puzzle piece from the master contract image.
- Draw that piece as the background of the card.
- Apply a subtle dark tint over it so the white "AVAILABLE" and "BUY THIS TILE" text remains readable.
- The neon borders and corner brackets will still draw over the image, maintaining the premium UI feel while creating the global illusion.

## Verification Plan
- Load the app and verify that the available tiles visually combine to form the master image perfectly, across different screen sizes.
- Verify that sold tiles (which have an uploaded image) are unaffected and break the pattern as expected (like claimed puzzle pieces).

> [!IMPORTANT]
> **Open Question for User:** Do you have a specific master "Contract Ad" image you want me to use for this illusion? If not, I can generate a cool placeholder image (like a galaxy or abstract tech background) to demonstrate the effect!
