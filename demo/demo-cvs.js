import './../casper-virtual-scroller';
import { LitElement, html, css } from 'lit';

class DemoCVS extends LitElement {

  static styles = css`
    .main-container {
    }
    #cvs {
      background-color: lightblue;
    }
  `;

  constructor () {
    super();
    this.items = [
      {id: 1, name: 'teste1'},
      {id: 2, name: 'teste2'},
      {id: 3, name: 'teste3'},
      {id: 4, name: 'teste4'},
      {id: 5, name: 'teste5'},
      {id: 6, name: 'teste6'},
      {id: 7, name: 'teste7'},
      {id: 8, name: 'teste8'},
      {id: 9, name: 'teste9'},
      {id: 10, name: 'teste10'},
      {id: 11, name: 'teste11'},
      {id: 12, name: 'teste12'},
      {id: 13, name: 'teste13'},
      {id: 14, name: 'teste14'},
      {id: 15, name: 'teste15'},
      {id: 16, name: 'teste16'},
      {id: 17, name: 'teste17'},
      {id: 18, name: 'teste18'},
      {id: 19, name: 'teste19'},
      {id: 20, name: 'teste20'},
      {id: 21, name: 'teste21'},
      {id: 22, name: 'teste22'},
      {id: 23, name: 'teste23'},
    ]
  }

  render () {
    return html`
      <p>Casper virtual scroller demo</p>
      <div class="main-container">
        <casper-virtual-scroller
          id="cvs"
          width="200"
          height="200"
          dataSize="40"
          .items="${this.items}">
        </casper-virtual-scroller>
      </div>
    `
  }
}

window.customElements.define('demo-cvs', DemoCVS);