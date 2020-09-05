const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const { bannerElement, searchInput, searchForm, resultElement } = getElements(document);
  const state = { topResult: false, offset: 0 };
  const setTopResult = topResult => { state.topResult = topResult; };
  const app = new App({ emoji, setTopResult });
  boundOnSearchKeyup = () => onSearchKeyup(resultElement, app, searchInput, state.offset);
  boundOnSearchKeyup();
  const moveDown = () => { state.offset += 1; };
  const moveUp = () => { state.offset -= 1; };
  searchInput.addEventListener('keyup', onArrowKeys.bind(null, moveDown, moveUp));
  searchInput.addEventListener('keyup', boundOnSearchKeyup);
  searchForm.addEventListener('submit', () => onSubmit(state.topResult, bannerElement));
}

document.addEventListener('DOMContentLoaded', main);

function onArrowKeys(moveDown, moveUp, { key, preventDefault }) {
  switch (key) {
    case 'ArrowDown': return moveDown();
    case 'ArrowUp': return moveUp();
  }
}

function onSearchKeyup(resultElement, app, searchInput, offset) {
  render(resultElement, app, {
    maxResults: 50,
    query: preProcessQuery(searchInput),
    offset
  });
}

function onSubmit(topResult, bannerElement) {
  if (!topResult) return;
  navigator.clipboard.writeText(topResult.emoji);
  bannerElement.innerHTML = `Copied '${topResult.emoji}' to the clipboard`;
}

function preProcessQuery(searchInput) {
  const defaultQuery = searchInput.getAttribute('placeholder');
  return searchInput.value.length > 0
    ? searchInput.value.trim()
    : defaultQuery;
}

function getElements(document) {
  const bannerElement = document.querySelector('#banner');
  const searchInput = document.querySelector('#search');
  const searchForm = document.querySelector('#search_form');
  const resultElement = document.querySelector('#results');
  return { bannerElement, searchInput, searchForm, resultElement };
}

class App {
  constructor({ emoji, setTopResult }) {
    this.emoji = emoji;
    this.setTopResult = setTopResult;
    this.results = { '': emoji };
  }

  render({ maxResults, query, offset }) {
    const results = this._getResultsForQueryAndUpdateCache(query);
    const { topResult, rest } = this._getResultParts(results, offset);
    this.setTopResult(topResult);
    if (topResult) {
      return `
        <div class='top-result'>
          <h2 class='top-result__result'>${topResult.emoji} ${topResult.description}</h2>
          <div class='top-result__instructions'>(Enter/Submit to copy)</div>
        </div>

        ${rest.slice(1, 1 + maxResults).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${rest.length > (1 + maxResults) ? `<div>(and ${rest.length - 1 - maxResults} more)</div>` : ''}
      `;
    } else {
      return `No results for ${query}`;
    }
  }

  _getResultParts(results, offset) {
    const index = offset % results.length;
    const topResult = results[index];
    const before = index > 0 ? results.slice(0, index) : [];
    const after = results.slice(index + 1, -1);
    const spacer = { emoji: '&nbsp;', description: '&nbsp;' };
    return { topResult, rest: [...after, spacer, ...before] };
  }

  _getResultsForQueryAndUpdateCache(query) {
    const emoji = this.emoji;
    const bestGuess = this.results[query.slice(0,-1)] || emoji;
    const queryTerms = query.toLowerCase().split(' ');
    const filteredResults = this.results[query]
      || bestGuess.filter(({ description }) => queryTerms.every(term => description.toLowerCase().match(term)));
    this.results[query] = filteredResults;
    return filteredResults
  }
}

function render(element, component, props) {
  element.innerHTML = component.render(props);
}
