const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const bannerElement = document.querySelector('#banner');
  const searchInput = document.querySelector('#search');
  const searchForm = document.querySelector('#search_form');
  const resultElement = document.querySelector('#results');
  const results = { '': emoji };
  let topResult = false;

  function onSearchKeyup() {
    const defaultQuery = searchInput.getAttribute('placeholder');
    const query = searchInput.value.length > 0 ? searchInput.value.trim() : defaultQuery;

    const bestGuess = results[query.slice(0,-1)] || emoji;

    const queryTerms = query.split(' ');
    const result = results[query] || bestGuess.filter(x => queryTerms.every(term => x.description.match(term)));
    results[query] = result;
    topResult = result[0];

    const maxResults = 50;

    if (topResult) {
      resultElement.innerHTML = `
        <div class='top-result'>
          <h2 class='top-result__result'>${result[0].emoji} ${result[0].description}</h2>
          <div class='top-result__instructions'>(Enter/Submit to copy)</div>
        </div>

        ${result.slice(1, 1 + maxResults).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${result.length > (1 + maxResults) ? `<div>(and ${result.length - 1 - maxResults} more)</div>` : ''}
      `;
    } else {
      resultElement.innerHTML = `No results for ${query}`;
    }
  }

  function onSubmit() {
    if (!topResult) return;
    navigator.clipboard.writeText(topResult.emoji);
    bannerElement.innerHTML = `Copied '${topResult.emoji}' to the clipboard`;
  }

  onSearchKeyup();
  searchInput.addEventListener('keyup', onSearchKeyup);
  searchForm.addEventListener('submit', onSubmit);
}

document.addEventListener('DOMContentLoaded', main);

