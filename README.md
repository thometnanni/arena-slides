# Arena Slides

A minimal, no-UI slideshow for [Are.na](https://www.are.na) boards — images and videos on a black screen, navigated by keyboard or click.

**→ [thometnanni.github.io/arena-slides](https://thometnanni.github.io/arena-slides)**

---

## Usage

Boards are passed as URL parameters. Each parameter key is a board slug; the value controls its behaviour.

### Manual navigation

```
https://thometnanni.github.io/arena-slides/?your-board-slug
```

Blocks fill the window (`object-fit: cover`). Navigate with **arrow keys** or **click**.

### Autoplay loop

```
https://thometnanni.github.io/arena-slides/?your-board-slug=loop-2500
```

The value `loop-{ms}` sets the interval in milliseconds. Blocks are contained on a black background and accumulate on screen — the first pass reveals images one by one; subsequent passes cycle them to the front.

Clicking or pressing an arrow key jumps to the next/previous board entirely (autoplay boards are treated as a single unit).

### Multiple boards

```
https://thometnanni.github.io/arena-slides/?board-one=loop-2500&board-two
```

Boards play in sequence. Mix autoplay and manual boards freely.

---

## Notes

- Only **images** and **video files** are shown; text, links, and embeds are ignored.
- Videos autoplay muted and loop.
- Navigation wraps around — the last board leads back to the first.
