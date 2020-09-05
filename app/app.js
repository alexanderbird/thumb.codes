const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const { bannerElement, searchInput, searchForm, resultElement } = getElements(document);
  const state = {};
  const setLastQuery = lastQuery => { state.lastQuery = lastQuery; };
  const app = new App({ emoji, maxResults: 50 });
  boundOnSearchKeyup = () => onSearchKeyup(resultElement, app, searchInput, state.lastQuery, setLastQuery);
  searchInput.addEventListener('keyup', boundOnSearchKeyup);
  searchForm.addEventListener('submit', () => onSubmit(getTopResult(), bannerElement));
  document.body.addEventListener('keyup', onArrowKeys.bind(null, moveSelection(getNextSibling), moveSelection(getPreviousSibling)));
  document.body.addEventListener('click', ({ target }) => target.tagName.toLowerCase() === 'input' && target.type === 'radio' && onSubmit(target.value, bannerElement));
  document.body.addEventListener('keyup', ({ key }) => key === 'Enter' && onSubmit(getTopResult(), bannerElement));
}

document.addEventListener('DOMContentLoaded', main);

function moveSelection(getAdjacentSibling) {
  return function boundMoveSelection() {
    const newSelection = getAdjacentSibling(document.querySelector("input[type='radio']:checked"), "input[type='radio']");
    if (!newSelection) return;
    newSelection.checked = true;
    document.querySelector(`label[for='${newSelection.value}']`).scrollIntoView();
  }
}

function getTopResult() {
  return document.querySelector("input[type='radio']:checked").value;
}

function onArrowKeys(moveDown, moveUp, { key, preventDefault }) {
  switch (key) {
    case 'ArrowDown': return moveDown();
    case 'ArrowUp': return moveUp();
  }
}

function onSearchKeyup(resultElement, app, searchInput, lastQuery, setLastQuery) {
  const query = preProcessQuery(searchInput);
  if (query === lastQuery) return;
  setLastQuery(query);
  render(resultElement, app, { query });
}

function onSubmit(topResult, bannerElement) {
  if (!topResult) return;
  navigator.clipboard.writeText(topResult);
  bannerElement.innerHTML = `Copied '${topResult}' to the clipboard`;
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
  constructor({ emoji, maxResults }) {
    this.emoji = emoji;
    this.maxResults = maxResults;
    this.results = { '': emoji };
  }

  render({ query }) {
    console.log('render');
    const allResults = this._getResultsForQueryAndUpdateCache(query);
    const results = allResults.slice(0, this.maxResults);
    const hiddenResultCount = allResults.length - results.length;
    if (results.length) {
      return `
        ${results.map((result, i) => this._renderResult({ ...result, isChecked: i === 0 })).join('\n')}
        ${hiddenResultCount > 0 ? `<div>(${hiddenResultCount} other result${hiddenResultCount === 1 ? '' : 's'} omitted)</div>` : ''}
      `;
    } else {
      return `No results for ${query}`;
    }
  }

  _renderResult({ emoji, description, isChecked }) {
    return `
      <input type='radio' name='emoji' value='${emoji}' id='${emoji}' ${ isChecked ? 'checked' : '' }/>
      <label for='${emoji}' >${emoji} ${description}</label>
    `;
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

// Adapted from https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
function getPreviousSibling(element, selector) {
  var sibling = element.previousElementSibling;
  if (!selector) return sibling;
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.previousElementSibling;
  }
}

function getNextSibling(element, selector) {
  var sibling = element.nextElementSibling;
  if (!selector) return sibling;
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.nextElementSibling
  }
}

