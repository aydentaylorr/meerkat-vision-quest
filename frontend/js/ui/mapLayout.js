/* Where the grade landmarks go on the map: a winding trail that fits, whole, in the space between
   the top bar and the bottom card, whatever the screen size. */

/* How far a landmark reaches from its centre, in landmark widths, including Nomi standing on it
   (above) and its label (below). */
export const ABOVE = 0.66, BELOW = 0.5;
const SIDE = 62;             // keeps clear of the corner buttons
const COL = 1.25, ROW = 1.22; // room each landmark needs, in landmark widths

/* Returns the landmark width and each centre, in screen pixels. `top` and `bottom` are the edges of
   the free space, `maxWidth` the largest a landmark should get. */
export function mapLayout({ width, top, bottom, count, maxWidth }){
  const freeW = width - 2 * SIDE, freeH = Math.max(bottom - top, 60);
  // use however many rows give the biggest landmarks; two rows win a tie
  let rows = 2, size = 0;
  for(const r of [2, 3, 1, 4]){
    const s = Math.min(maxWidth, freeW / (Math.ceil(count / r) * COL), freeH / (r * ROW));
    if(s > size + 0.5){ size = s; rows = r; }
  }
  const rowH = freeH / rows;
  const sway = Math.max(0, rowH - ROW * size) / 2 * 0.7;   // spare height makes the trail wind
  const spots = [];
  for(let r = 0; r < rows; r++){
    const n = Math.floor(count / rows) + (r < count % rows ? 1 : 0);
    for(let k = 0; k < n; k++){
      const column = r % 2 ? n - 1 - k : k;                // every other row runs back again
      spots.push({
        x: SIDE + freeW * (column + 0.5) / n,
        y: top + rowH * (r + 0.5) + (ABOVE - BELOW) / 2 * size + (column % 2 ? -sway : sway)
      });
    }
  }
  return { size, spots };
}
