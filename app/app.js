const emojiPromise = fetch('/emoji.json').then(r => r.json());

function render(element, component, props) {
  element.innerHTML = component.render(props);
}

class App {
  constructor({ emoji }) {
    this.emoji = emoji;
    this.results = { '': emoji };
  }

  render({ maxResults, query }) {
    const results = this._getResultsForQueryAndUpdateCache(query);
    const topResult = results[0];
    if (topResult) {
      return `
        <div class='top-result'>
          <h2 class='top-result__result'>${topResult.emoji} ${topResult.description}</h2>
          <div class='top-result__instructions'>(Enter/Submit to copy)</div>
        </div>

        ${results.slice(1, 1 + maxResults).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${results.length > (1 + maxResults) ? `<div>(and ${results.length - 1 - maxResults} more)</div>` : ''}
      `;
    } else {
      return `No results for ${query}`;
    }
  }

  _getResultsForQueryAndUpdateCache(query) {
    const bestGuess = this.results[query.slice(0,-1)] || this.emoji;
    const queryTerms = query.toLowerCase().split(' ');
    const filteredResults = this.results[query]
      || bestGuess.filter(({ description }) => queryTerms.every(term => description.toLowerCase().match(term)));
    this.results[query] = filteredResults;
    return filteredResults
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
  const app = new App({ emoji });

  function onSearchKeyup() {
    render(resultElement, app, {
      maxResults: 50,
      query: preProcessQuery(searchInput)
    });
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

