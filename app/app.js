const emojiPromise = fetch('/emoji.json').then(r => r.json());

function render(element, component, props) {
  element.innerHTML = component.render(props);
}

class App {
  render({ topResult, result, maxResults, query }) {
    if (topResult) {
      return `
        <div class='top-result'>
          <h2 class='top-result__result'>${result[0].emoji} ${result[0].description}</h2>
          <div class='top-result__instructions'>(Enter/Submit to copy)</div>
        </div>

        ${result.slice(1, 1 + maxResults).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${result.length > (1 + maxResults) ? `<div>(and ${result.length - 1 - maxResults} more)</div>` : ''}
      `;
    } else {
      return `No results for ${query}`;
    }
  }
}

function preProcessQuery(searchInput) {
  const defaultQuery = searchInput.getAttribute('placeholder');
  return searchInput.value.length > 0
    ? searchInput.value.trim()
    : defaultQuery;
}

async function main() {
  const emoji = await emojiPromise;
  const bannerElement = document.querySelector('#banner');
  const searchInput = document.querySelector('#search');
  const searchForm = document.querySelector('#search_form');
  const resultElement = document.querySelector('#results');
  const results = { '': emoji };
  let topResult = false;

  function onSearchKeyup() {
    const query = preProcessQuery(searchInput);

    const bestGuess = results[query.slice(0,-1)] || emoji;

    const queryTerms = query.toLowerCase().split(' ');
    const result = results[query] || bestGuess.filter(x => queryTerms.every(term => x.description.toLowerCase().match(term)));
    results[query] = result;
    topResult = result[0];

    const maxResults = 50;

    const app = new App();

    render(resultElement, app, { topResult, result, maxResults, query });
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

