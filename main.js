const API = "https://api.are.na/v3/channels";

let boards = [];
let boardIndex = 0;
let autoplayTimer = null;

function parseBoards() {
  const params = new URLSearchParams(window.location.search);
  const result = [];
  for (const [slug, value] of params) {
    const match = value.match(/^loop-(\d+)$/);
    result.push({
      slug,
      autoplay: !!match,
      interval: match ? parseInt(match[1], 10) : null,
      blocks: [],
      slideIndex: 0,
    });
  }
  return result;
}

async function fetchAllBlocks(slug) {
  const first = await fetch(`${API}/${slug}/contents?per=100&page=1`).then(
    (r) => r.json(),
  );
  const meta = first.meta ?? {};
  const totalPages =
    (meta.total_pages ??
      Math.ceil(
        (meta.total_count ?? first.data.length) / (meta.per_page ?? 100),
      )) ||
    1;
  let contents = first.data;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        fetch(`${API}/${slug}/contents?per=100&page=${i + 2}`).then((r) =>
          r.json(),
        ),
      ),
    );
    for (const page of rest) contents = contents.concat(page.data);
  }
  return contents;
}

function filterBlocks(contents) {
  return contents.filter((b) => {
    if (b.type === "Image") return true;
    if (
      b.type === "Attachment" &&
      b.attachment?.content_type?.startsWith("video/")
    )
      return true;
    return false;
  });
}

function showCurrent() {
  const slide = document.getElementById("slide");
  slide.innerHTML = "";

  const board = boards[boardIndex];
  const block = board.blocks[board.slideIndex];
  if (!block) return;

  let el;
  if (block.type === "Image") {
    el = document.createElement("img");
    el.src = block.image?.large?.src || block.image?.src || "";
    el.alt = block.title || "";
  } else {
    el = document.createElement("video");
    el.src = block.attachment.url;
    el.autoplay = true;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
  }

  slide.appendChild(el);
}

function advanceAutoplaySlide() {
  const board = boards[boardIndex];
  board.slideIndex = (board.slideIndex + 1) % board.blocks.length;
  showCurrent();
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = null;
  const board = boards[boardIndex];
  if (board.autoplay) {
    autoplayTimer = setInterval(advanceAutoplaySlide, board.interval);
  }
}

function next() {
  const board = boards[boardIndex];
  if (board.autoplay) {
    boardIndex = (boardIndex + 1) % boards.length;
    boards[boardIndex].slideIndex = 0;
  } else {
    if (board.slideIndex < board.blocks.length - 1) {
      board.slideIndex++;
    } else {
      boardIndex = (boardIndex + 1) % boards.length;
      boards[boardIndex].slideIndex = 0;
    }
  }
  resetAutoplay();
  showCurrent();
}

function prev() {
  const board = boards[boardIndex];
  if (board.autoplay) {
    boardIndex = (boardIndex - 1 + boards.length) % boards.length;
    boards[boardIndex].slideIndex = 0;
  } else {
    if (board.slideIndex > 0) {
      board.slideIndex--;
    } else {
      boardIndex = (boardIndex - 1 + boards.length) % boards.length;
      boards[boardIndex].slideIndex = 0;
    }
  }
  resetAutoplay();
  showCurrent();
}

async function init() {
  boards = parseBoards();
  if (!boards.length) return;

  const allContents = await Promise.all(
    boards.map(async (b) => await fetchAllBlocks(b.slug)),
  );
  for (let i = 0; i < boards.length; i++) {
    boards[i].blocks = filterBlocks(allContents[i]);
  }

  showCurrent();
  resetAutoplay();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

document.addEventListener("click", next);

init();
