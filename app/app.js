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
    const query = searchInput.value.length <= 1 ? '' : searchInput.value.replace(/ /g, '.*');

    const bestGuess = results[query.slice(0,-1)] || emoji;

    const result = results[query] || bestGuess.filter(x => x.description.match(query));
    results[query] = result;
    topResult = result[0];

    if (topResult) {
      resultElement.innerHTML = `
        <h2>${result[0].emoji} ${result[0].description}</h2>
        ${result.slice(1,11).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${result.length > 11 ? `<div>(and ${result.length - 11} more)</div>` : ''}
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

