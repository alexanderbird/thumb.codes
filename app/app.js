const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const searchInput = document.querySelector('#search');
  const resultElement = document.querySelector('#results');
  const results = { '': emoji };

  function onSearchKeyup() {
    const query = searchInput.value.length <= 1 ? '' : searchInput.value;

    const bestGuess = results[query.slice(0,-1)] || emoji;

    const result = results[query] || bestGuess.filter(x => x.description.match(query));
    results[query] = result;

    if (result[0]) {
      resultElement.innerHTML = `
        <h2>${result[0].emoji} ${result[0].description}</h2>
        ${result.slice(1,11).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${result.length > 11 ? `<div>(and ${result.length - 11} more)</div>` : ''}
      `;
    } else {
      resultElement.innerHTML = `No results for ${query}`;
    }
  }

  searchInput.addEventListener('keyup', onSearchKeyup);
  console.log(emoji[4]);
}

document.addEventListener('DOMContentLoaded', main);

