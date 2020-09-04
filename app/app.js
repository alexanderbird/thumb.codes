const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const { bannerElement, searchInput, searchForm, resultElement } = getElements(document);
  const [ getState, setState ] = useState({ topResult: false, emoji });
  const app = new App(getState, setState);
  boundOnSearchKeyup = onSearchKeyup.bind(null, resultElement, app, searchInput);
  boundOnSearchKeyup();
  searchInput.addEventListener('keyup', boundOnSearchKeyup);
  searchForm.addEventListener('submit', onSubmit.bind(null, getState, bannerElement));
}

document.addEventListener('DOMContentLoaded', main);

function onSearchKeyup(resultElement, app, searchInput) {
  render(resultElement, app, {
    maxResults: 50,
    query: preProcessQuery(searchInput)
  });
}

function onSubmit(getState, bannerElement) {
  const { topResult } = getState();
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
  constructor(getState, setState) {
    const { emoji } = getState();
    this.getState = getState;
    this.setState = setState;
    this.results = { '': emoji };
  }

  render({ maxResults, query }) {
    const results = this._getResultsForQueryAndUpdateCache(query);
    const topResult = results[0];
    this.setState({ topResult });
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
    const { emoji } = this.getState();
    const bestGuess = this.results[query.slice(0,-1)] || emoji;
    const queryTerms = query.toLowerCase().split(' ');
    const filteredResults = this.results[query]
      || bestGuess.filter(({ description }) => queryTerms.every(term => description.toLowerCase().match(term)));
    this.results[query] = filteredResults;
    return filteredResults
  }
}

/** rudimentary "Framework" */

function render(element, component, props) {
  element.innerHTML = component.render(props);
}

function useState(initialState) {
  let state = { ...initialState };
  function getState() {
    return state;
  }
  function setState(newState) {
    state = { ...state, ...newState };
  }
  return [ getState, setState ];
}

