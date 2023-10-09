import { LitElement, html, css, unsafeCSS } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import 'wc-spinners/dist/spring-spinner.js';
import '@cloudware-casper/casper-icons/casper-icon-button.js';

class CasperVirtualScroller extends LitElement {

  static get properties() {
    return {
      items: {},
      startIndex: {
        type: Number
      },
      dataSize: {
        type: Number
      },
      selectedItem: {
        type: String
      },
      selectedItems: {
        type: Array
      },
      textProp: {
        type: String
      },
      idProp: {
        type: String
      },
      lineCss: {
        type: String
      },
      renderPlaceholder: {
        type: Function
      },
      renderLine: {
        type: Function
      },
      renderNoItems: {
        type: Function
      },
      renderSeparator: {
        type: Function
      },
      height: {
        type: Number
      },
      width: {
        type: Number
      },
      unsafeRender: {
        type: Boolean
      },
      multiSelect: {
        type: Boolean,
        reflect: true,
        attribute: 'multi-select'
      },
      delaySetup: {
        type: Boolean
      },
      loading: {
        type: Boolean
      },
      unlistedItem: {
        type: Object
      },
      _currentRow: {
        type: Number,
        attribute: false
      },
      _cvsItems: {
        type: Array,
        attribute: false
      },
      _setupDone: {
        type: Boolean,
        attribute: false
      }
    }
  }

  static styles = css`
    :host {
      --cvs-font-size: 0.875rem;
      --cvs-background-color: #FFF;
      --cvs-color: var(--primary-text-color, #444);
      overscroll-behavior: contain;
      font-size: var(--cvs-font-size);
      display: block;
      overflow: auto;
      border: 1px solid #AAA;
      background-color: var(--cvs-background-color);
      color: var(--cvs-color);
      border-radius: 0 0 3px 3px;
      transition: width 250ms linear;
      box-shadow: rgb(25 59 103 / 5%) 0px 0px 0px 1px, rgb(28 55 90 / 16%) 0px 2px 6px -1px, rgb(28 50 79 / 38%) 0px 8px 24px -4px;
    }

    .cvs__wrapper {
      font-size: var(--cvs-font-size);
      display: grid;
      white-space: nowrap;
    }

    .cvs__no-items {
      text-align: center;
      font-size: var(--cvs-font-size);
      padding: 0.715em;
    }

    .cvs__item-row {
      font-size: var(--cvs-font-size);
      padding: 0.3575em 0.715em;
      white-space: nowrap;
      cursor: default;
      transition: color 250ms, background-color 250ms;
    }

    :host(:not([multi-select])) .cvs__item-row[selectable][active] {
      background-color: var(--dark-primary-color);
      color: white;
    }

    .cvs__item-row[disabled] {
      pointer-events: none;
      opacity: 0.5;
    }

    .cvs__item-row[selectable]:hover {
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }

    .cvs__placeholder {
      filter: blur(3px);
    }


    /* MULTI-SELECT */

    :host([multi-select]) {
      --cvs-multi-border-width: 0.08em;
      --cvs-multi-outline-width: 0.16em;
    }

    :host([multi-select]) .cvs__item-row[selectable] {
      position: relative;
      box-sizing: border-box;
      border: solid calc(var(--cvs-multi-border-width) + var(--cvs-multi-outline-width)) var(--cvs-background-color);
      border-radius: calc(2.5 * var(--cvs-multi-outline-width));
    }

    :host([multi-select]) .cvs__item-row[selectable][active] {
      border-radius: calc(5 * var(--cvs-multi-outline-width));
    }

    :host([multi-select]) .cvs__item-row[selectable][selected] {
      background-color: var(--dark-primary-color);
      color: #FFF;
    }

    :host([multi-select]) .cvs__item-row[selectable]:hover,
    :host([multi-select]) .cvs__item-row[selectable][selected]:hover {
      background-color: var(--primary-color);
      color: #FFF;
    }

    :host([multi-select]) .cvs__item-row[selectable]::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      box-sizing: border-box;
      pointer-events: none;
      border-radius: var(--cvs-multi-outline-width);
      box-shadow: white 0px 0px 0px var(--cvs-multi-border-width) inset;
      border: solid var(--cvs-multi-border-width) var(--primary-color);
      outline: solid var(--cvs-multi-outline-width) rgba(var(--primary-color-rgb), 0.5);
      transition: opacity 250ms;
    }

    :host([multi-select]) .cvs__item-row[selectable][active]::after {
      opacity: 1;
    }

    .cvs__actions {
      font-size: var(--cvs-font-size);
      width: 100%;
      max-height: 50%;
      position: sticky;
      bottom: 0;
      display: flex;
      padding: 0.35em 0.5em;
      box-sizing: border-box;
      background-color: #FFF;
      box-shadow: rgba(0, 0, 0, 0.2) 0px -0.16em 1.42em;
      border-top: 0.08em solid rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .cvs__actions-inner {
      flex-grow: 1;
      display: flex;
      gap: 1em;
      overscroll-behavior: contain;
      overflow-y: auto;
    }

    .cvs__labels-list {
      font-size: 0.94em;
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      list-style-type: none;
      padding: 0;
      margin: 0;
      gap: 0.35em;
      color: var(--secondary-text-color);
    }

    .cvs__label {
      width: min(100%, 7.5em);
      flex-grow: 1;
      padding: 0.16em 0.5em 0.16em 0.3em;
      display: flex;
      align-items: center;
      gap: 0.25em;
      border-radius: 2em;
      border: 0.04em solid;
      transition: all 0.5s;
    }

    .cvs__label:hover {
      background-color: rgba(var(--primary-color-rgb), 0.1);
      color: var(--primary-color);
      cursor: pointer;
    }

    .cvs__label-icon {
      flex-shrink: 0;
      background-color: transparent;
      color: inherit;
      border: none;
      padding: 0px;
      outline: none;
      font-size: 1em;
      width: 1.1em;
      height: 1.1em;
    }

    .cvs__label-icon:hover {
      background-color: var(--primary-color);
      color: #FFF;
    }

    .cvs__label-text {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .cvs__buttons-container {
      font-size: 0.785em;
      align-self: stretch;
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .cvs__close-button {
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      background-color: var(--button-primary-color);
      border: 0.09em solid var(--button-primary-color);
      color: #FFF;
      padding: 0.5em 1em;
      border-radius: 0.4em;
      outline: none;
      text-transform: uppercase;
      transition: all 0.5s;
    }

    .cvs__close-button:hover {
      cursor: pointer;
      background-color: var(--light-primary-color);
      color: var(--button-primary-color);
    }
  `;

  _items = [];
  set items(val) {
    let oldVal = this._items;
    if (Array.isArray(val)) {
      this._items = val;
    } else {
      this._items = [];  
    }
    this.requestUpdate('items', oldVal);
  }
  get items() { return this._items; }

  get renderedItemsLength() {return this._cvsItems?.length ?? 0 }

  constructor () {
    super();
    this._oldScrollTop = 0;
    this._scrollDirection = 'none';
    this.idProp = 'id';
    this.textProp = 'name';
    this.multiSelect = false;
    this.selectedItems = [];

    this.okButtonHandler = () => {return};
    this.okButtonLabel = 'OK';
  }

  connectedCallback () {
    super.connectedCallback();
    this.addEventListener('scroll', (event) => { this._onScroll(event) });

    this._renderLine = this.unsafeRender ? this._renderLineUnsafe : this._renderLineSafe;
    this.renderNoItems = this.renderNoItems || this._renderNoItems;
    this.renderPlaceholder = (this.renderPlaceholder || this._renderPlaceholder);
    this.renderSeparator = this.renderSeparator || this._renderSeparator;
    this._setupDone = false;
  }

  //***************************************************************************************//
  //                                ~~~ LIT life cycle ~~~                                 //
  //***************************************************************************************//

  render () {
    if(this.loading) {
      // Loading render spinner
      return this._renderLoading();
    }

    this._itemList = [];

    if (this.dataSize === 0 || (this._cvsItems && this._cvsItems.length === 0)) {
      if (this.unlistedItem) {
        // Only render unlisted item
        return this._renderUnlisted();
      } else {
        // No items
        return this.renderNoItems();
      }
    }

    if (this._rowHeight === -1) {
      // Initial render to calculate row height
      return this._renderLine(this._cvsItems[0]);
    }

    if (this._setupDone === false) {
      // Initial render to setup scroll height
      return this._renderContainerWithoutItems();
    }

    // Initial stuff done... Now do real work

    // List size cant be bigger than dataSize
    const listSize = Math.min(this.dataSize, Math.round(this._wrapperHeight / this._rowHeight));
    if (!listSize) return;

    // Current row cant go higher than this.dataSize-listSize and lower than 0
    this._currentRow = Math.max(0, Math.min(this._currentRow,this.dataSize-listSize));

    let hasPlaceholders = false;

    // We might need to optimize this... O((log2*this._cvsItems.length)*listSize)
    for (let idx = 0; idx < listSize; idx++) {
      // Check if the item exists
      const elementIdx = this._itemsBinarySearch(this._currentRow + idx);
      if (elementIdx > -1) {
        // Item exists - render it
        this._itemList[idx] = this._cvsItems[elementIdx];
      } else {
        // Item does not exist - render placeholder
        hasPlaceholders = true;
        this._itemList[idx] = { listId: this._currentRow + idx, placeholder: true };
      }
    }

    // Request new items if we find a placeholder
    if (hasPlaceholders) {
      const placeholderPositions = this._itemList.filter(e => e.placeholder);
      this.dispatchEvent(new CustomEvent('cvs-request-items', {
        bubbles: true,
        composed: true,
        detail: {
          direction: this._scrollDirection,
          index: this._scrollDirection === 'up' ? placeholderPositions[placeholderPositions.length-1].listId : placeholderPositions[0].listId
        }
      }));
    }

    return html`
      <style>
        :host {
          width: ${this.width ? (this.width+'px') : 'fit-content'};
          height: ${(this._rowHeight * (listSize + (this.unlistedItem ? 1 : 0))) + 'px'};
        }
        .cvs__top-padding {
          height: ${(this._currentRow * this._rowHeight) + 'px'};
        }
        .cvs__bottom-padding {
          height: ${((this.dataSize - listSize - this._currentRow) * this._rowHeight) + 'px'};
        }
      </style>

      <div class="cvs__wrapper">
        <div class="cvs__top-padding"></div>
          ${repeat(this._itemList, a => a.listId, this._renderLine.bind(this))}
        <div class="cvs__bottom-padding"></div>
        ${this.unlistedItem ? this._renderLine(this.unlistedItem) : ''}
      </div>
      ${this.multiSelect ? html`
        <div class="cvs__actions">
          <div class="cvs__actions-inner">
            <ul class="cvs__labels-list">
              ${repeat(this.selectedItems, a => a.listId, (itemId,index) => {
                const item = this.items.find(e => e[this.idProp] == itemId);
                return item ? html`
                  <li class="cvs__label" tooltip="${item[this.textProp]}" @click="${this._labelClicked}" data-item="${itemId}">
                    <casper-icon-button icon="fa-light:times-circle" class="cvs__label-icon" @click="${this._removeValueClicked}"></casper-icon-button>
                    <span class="cvs__label-text">${item[this.textProp]}</span>
                  </li>
                ` : '';
              })}
            </ul>
            <div class="cvs__buttons-container">
              <button class="cvs__close-button" @click=${this.okButtonHandler}>${this.okButtonLabel}</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  firstUpdated () {
    if (!this.delaySetup) {
      this.initialSetup();
    }
    this.addEventListener('keydown', this._handleKeyPress.bind(this));
  }

  updated (changedProperties) {
    if (changedProperties.has('items') && changedProperties.get('items') !== undefined) {
      if (JSON.stringify(this.items) !== JSON.stringify(changedProperties.get('items'))) {
        this.initialSetup();
      }
    }
  }

  async getUpdateComplete () {
    await super.getUpdateComplete();

    // Wait for all the rows to render
    const rows = Array.from(this.shadowRoot.querySelectorAll('.cvs__item-row'));
    await Promise.all(rows.map(el => el.updateComplete));
    return true;
  }

  //***************************************************************************************//
  //                               ~~~ Public functions~~~                                 //
  //***************************************************************************************//

  async initialSetup () {
    if (this._runningSetup) return;
    this._runningSetup = true; // Lock function
    this._currentRow = 0;
    this._rowHeight = -1;
    this._setupDone = false;
    if (this.dataSize === undefined || this.dataSize === 0) this.dataSize = this.items.length;

    this._cvsItems = JSON.parse(JSON.stringify(this.items));
    const offset = (this.startIndex || 0);

    this._wrapperHeight = (this.height || Math.round(Number(this.style.maxHeight.slice(0,-2))) || 300 );

    // If there are no items no need to calculate rowHeight, scrollTop, etc...
    if (this._cvsItems.length === 0) {
      this._runningSetup = false;
      return;
    }

    for (let idx = 0; idx < this._cvsItems.length; idx++) {
      this._cvsItems[idx].listId = offset + idx + Math.min(this.dataSize - (offset + this._cvsItems.length) , 0);
    }

    await this.updateComplete;

    this._rowHeight = this.shadowRoot.querySelector('.cvs__item-row').getBoundingClientRect().height;

    this.requestUpdate();

    await this.updateComplete;

    // Current row cant go higher than this.dataSize-listSize and lower than 0
    // TODO: Do we need this? check later
    // this._currentRow = Math.max(0, Math.min(this.dataSize, Math.round(this.scrollTop / this._rowHeight)));

    this._wrapperHeight = Math.min(this._rowHeight*this.items.length, this._wrapperHeight);

    this._setupDone = true;

    this.requestUpdate();

    await this.updateComplete;

    if (this.selectedItem) {
      this.scrollToId(this.selectedItem);
    } else {
      this.scrollToIndex(offset);
    }

    this._runningSetup = false;
  }

  updateHeight (height) {
    this._wrapperHeight = height;
    this.requestUpdate();
  }

  refreshHeight () {
    this._wrapperHeight = (this.height || Math.round(Number(this.style.maxHeight.slice(0,-2))) || 300 );
    this.requestUpdate();
  }

  appendBeginning (index, data) {
    for (let idx = 0; idx < data.length; idx++) {
      data[idx].listId = idx + index;
    }

    const sortedArray = data.concat(this._cvsItems).sort((a,b) => (a.listId > b.listId) ? 1 : ((b.listId > a.listId) ? -1 : 0));
    const simpleUniqueArray = [...new Set(sortedArray.map(i => i.listId))];

    let uniqueArray = [];
    let lastIdx = 0;
    for (const it of simpleUniqueArray) {
      for (let idx = lastIdx; idx < sortedArray.length; idx++) {
        if (it == sortedArray[idx].listId) {
          uniqueArray.push(sortedArray[idx]);
          lastIdx = idx;
          break;
        };
      }
    }

    this._cvsItems = uniqueArray;
    this.startIndex = index;
  }

  appendEnd (index, data) {
    for (let idx = 0; idx < data.length; idx++) {
      data[idx].listId = idx + index + Math.min(this.dataSize - (index + data.length), 0);
    }

    const sortedArray = this._cvsItems.concat(data).sort((a,b) => (a.listId > b.listId) ? 1 : ((b.listId > a.listId) ? -1 : 0));
    const simpleUniqueArray = [...new Set(sortedArray.map(i => i.listId))];

    let uniqueArray = [];
    let lastIdx = 0;
    for (const it of simpleUniqueArray) {
      for (let idx = lastIdx; idx < sortedArray.length; idx++) {
        if (it == sortedArray[idx].listId) {
          uniqueArray.push(sortedArray[idx]);
          lastIdx = idx;
          break;
        };
      }
    }

    this._cvsItems = uniqueArray;
  }

  getCurrentRow () {
    return this._currentRow;
  }

  scrollToIndex (idx, smooth=false) {
    if (smooth) {
      this.scroll({
        top: Math.max((idx * this._rowHeight) - (this._rowHeight * 2), 0),
        behavior: "smooth",
      });
    } else {
      this.scrollTop = Math.max((idx * this._rowHeight) - (this._rowHeight * 2), 0);
    }
  }

  scrollToId (id) {
    for (let idx = 0; idx < this._cvsItems.length; idx++) {
      if (this._cvsItems[idx][this.idProp] == id) {
        this.scrollToIndex(this._cvsItems[idx].listId);
        break;
      }
    }
  }

  smoothScrollToId (id) {
    for (let idx = 0; idx < this._cvsItems.length; idx++) {
      if (this._cvsItems[idx][this.idProp] == id) {
        this.scrollToIndex(this._cvsItems[idx].listId, true);
        break;
      }
    }
  }

  async moveSelection (dir) {
    const tmpItemList = JSON.parse(JSON.stringify(this._itemList));

    let listHasUnlisted = false
    if (this.unlistedItem && (!tmpItemList || tmpItemList.length === 0 || tmpItemList[tmpItemList.length-1].listId >= this.dataSize-1) )  {
      listHasUnlisted = true;
      tmpItemList.push(this.unlistedItem);
    }

    if (dir && tmpItemList && tmpItemList.length > 0) {
      if (this.selectedItem === undefined || tmpItemList.filter(e => e[this.idProp] == this.selectedItem).length === 0) {
        this.selectedItem = tmpItemList[0][this.idProp];
      } else {
        let selectedIdx = 0;
        for (let idx = 0; idx < tmpItemList.length; idx++) {
          if (this.selectedItem == tmpItemList[idx][this.idProp]) {
            selectedIdx = idx;
            break;
          }
        }
        if (dir === 'up' && (tmpItemList[selectedIdx].listId - 1 > -1 || this.unlistedItem)) {
          this.scrollTop -= this._rowHeight;
          if (tmpItemList[selectedIdx-1]) this.selectedItem = tmpItemList[selectedIdx-1][this.idProp];
        } else if (dir === 'down' && (tmpItemList[selectedIdx].listId + 1 <= this.dataSize-1 || this.unlistedItem)) {
          if (selectedIdx+1 > 1)  this.scrollTop += this._rowHeight;
          if (tmpItemList[selectedIdx+1]) this.selectedItem = tmpItemList[selectedIdx+1][this.idProp];
        } 
      }
    }
  }

  confirmSelection () {
    let item = this._itemList.filter(e => e[this.idProp] == this.selectedItem)?.[0];
    
    if (!item && this.unlistedItem) item = this.unlistedItem;

    if (item) {
      this.dispatchEvent(new CustomEvent('cvs-line-selected', {
        bubbles: true,
        composed: true,
        detail: {
          id: item[this.idProp],
          name: item?.[this.textProp],
          item: item
        }
      }));
    }
  }

  //***************************************************************************************//
  //                              ~~~ Private functions~~~                                 //
  //***************************************************************************************//

  _onScroll (event) {
    if (this._scrollTicking) {
      window.cancelAnimationFrame(this._scrollTicking);
      this._scrollTicking = null;
    }
    this._scrollTicking = window.requestAnimationFrame(() => {
      // Current row cant go higher than this.dataSize-listSize and lower than 0
      this._currentRow = Math.max(0, Math.min(this.dataSize, Math.round(this.scrollTop / this._rowHeight)));
    });

    if (this.scrollTop < this._oldScrollTop) {
      this._scrollDirection = 'up';
    } else if (this.scrollTop > this._oldScrollTop) {
      this._scrollDirection = 'down';
    } else {
      this._scrollDirection = 'none';
    }

    this._oldScrollTop = this.scrollTop;
  }

  _renderLineUnsafe (item) {
    if (item.separator) return this.renderSeparator(item);

    if (item.placeholder) return this.renderPlaceholder();

    const active = this.selectedItem && item[this.idProp] == this.selectedItem;
    let selected = false;
    if (this.multiSelect) {
      selected = this.selectedItems.includes(String(item[this.idProp]));
    }

    return html`
      <style>
        ${this.lineCss ? unsafeCSS(this.lineCss) : ''}
      </style>
      <div class="cvs__item-row" selectable @click="${this._lineClicked.bind(this, item)}" ?active="${active}" ?selected="${selected}" ?disabled=${item.disabled}>
        ${item.unsafeHTML ? unsafeHTML(item.unsafeHTML) : item[this.textProp]}
      </div>
    `;
  }

  _renderLineSafe (item) {
    if (item.separator) return this.renderSeparator(item);

    if (item.placeholder) return this.renderPlaceholder();

    const active = this.selectedItem && item[this.idProp] == this.selectedItem;
    let selected = false;
    if (this.multiSelect) {
      selected = this.selectedItems.includes(String(item[this.idProp]));
    }

    return html`
      <div class="cvs__item-row" selectable @click="${this._lineClicked.bind(this, item)}" ?active="${active}" ?selected="${selected}" ?disabled=${item.disabled}>
        ${this.renderLine ? this.renderLine(item) : item[this.textProp]}
      </div>
    `;
  }

  _renderPlaceholder () {
    return html`
      <div class="cvs__item-row">
        <div class="cvs__placeholder">Loading data!</div>
      </div>
    `;
  }

  _renderContainerWithoutItems () {
    const listSize = Math.min(this.dataSize, Math.round(this._wrapperHeight / this._rowHeight));

    return html`
      <style>
        :host {
          width: ${this.width ? (this.width+'px') : 'fit-content'};
          height: ${(this._rowHeight * listSize) + 'px'};
        }
        .cvs__top-padding {
          height: ${(this._currentRow * this._rowHeight) + 'px'};
        }
        .cvs__bottom-padding {
          height: ${(((this.dataSize - listSize - this._currentRow) * this._rowHeight) + this._wrapperHeight) + 'px'};
        }
      </style>
      <div class="cvs__top-padding"></div>
      <div class="cvs__bottom-padding"></div>
    `;
  }

  _renderNoItems () {
    return html `
      <div class="cvs__no-items">Sem resultados</div>
    `;
  }

  _renderLoading () {
    return html `
      <style>
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          padding: 20px;
          min-width: 150px;
          min-height: 100px;
        }
        .spinner {
          --spring-spinner__color: var(--primary-color);
          --spring-spinner__duration: 1.2s;
          --spring-spinner__size: 60px;
        }
      </style>

      <div class="spinner-container">
        <spring-spinner class="spinner"></spring-spinner>
      </div>
    `
  }

  _renderUnlisted () {
    return html`
      <style>
        :host {
          width: ${this.width ? (this.width+'px') : 'fit-content'};
          height: ${this._rowHeight + 'px'};
        }  
      </style>
      ${this._renderLine(this.unlistedItem)}
    `;
  }

  _renderSeparator (item) {
    return html`
      <style> 
        .separator {
          font-weight: bold;
        }
      </style>
      <div class="cvs__item-row">
        <div class="separator">${item[this.textProp]}</div>
      </div>
    `;
  }

  _lineClicked (item, event) {
    event.stopPropagation();

    this.dispatchEvent(new CustomEvent('cvs-line-selected', {
      bubbles: true,
      composed: true,
      detail: {
        id: item[this.idProp],
        name: item[this.textProp],
        item: item
      }
    }));
  }

  _removeValueClicked (event) {
    if (!this.multiSelect) return;
    event.stopPropagation();

    const item = event.currentTarget.parentElement.dataset.item;
    this.dispatchEvent(new CustomEvent('cvs-line-selected', {
      bubbles: true,
      composed: true,
      detail: {
        id: item
      }
    }));
  }

  _labelClicked (event) {
    event.stopPropagation();

    const item = event.currentTarget.dataset.item;
    this.smoothScrollToId(item);
  }

  _handleKeyPress (event) {
    switch (event.key) {
      case 'ArrowUp':
        this.moveSelection('up');
        break;
      case 'ArrowDown':
        this.moveSelection('down');
        break;
      case 'Tab':
        this.multiSelect ? this.okButtonHandler() : this.confirmSelection();
        break;
      case 'Enter':
        this.confirmSelection();
        break;
      default:
        break;
    }
  }

  _itemsBinarySearch (id) {
    let start = 0;
    let end = this._cvsItems.length - 1;

    while (start <= end) {
      const middle = Math.floor((start + end) / 2);
      if (this._cvsItems[middle].listId === id) {
        // Found the id
        return middle;
      } else if (this._cvsItems[middle].listId < id) {
        // Continue searching to the right
        start = middle + 1;
      } else {
        // Continue searching to the left
        end = middle - 1;
      }
    }
	  // id wasn't found
    return -1;
  }
}

window.customElements.define('casper-virtual-scroller', CasperVirtualScroller);