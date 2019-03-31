import { BaseComponent, html } from '../BaseComponent.js';
import { fc } from '../../fc/fc.js';
import '../../webcomponents-collection/input/InputCode.js';
import '../../webcomponents-collection/input/InputFile.js';
import '../model/ModelInputTree.js';

export class ModelForm extends BaseComponent {
  static get properties() {
    return {
      modelName: {
        type: String,
        value: ''
      },
      item: {
        type: Object
      }
    };
  }

  template() {
    if (!this.modelName) {
      return '';
    }

    return html`
      ${this.sharedStyles}
      <div>
        ${this.item
          ? html`
              <form @submit="${(e) => this.submit(e)}">${fc({ schema: this._model.schema, value: this.item, externalStyles: this.sharedStyles })} <button class="standard">Save</button></form>
            `
          : html`
              <div>Not found</div>
            `}
      </div>
    `;
  }

  async submit(e) {
    e.preventDefault();
    let el = this._content.querySelector('fc-object');
    Object.assign(this.item, el.value);
    await this.item.save();
    this.showToast({ text: 'Item saved' });
    this.emit('saved');
  }

  get _model() {
    return this.models[this.modelName];
  }

  async connectedCallback() {
    super.connectedCallback();
    if (!this.item) {
      this.item = new this._model();
    }
  }
}
window.customElements.define('model-form', ModelForm);
