import { BaseComponent, html } from '../BaseComponent.js';
import { icons } from '../icons.js';

export class ModelsTable extends BaseComponent {
  static get properties() {
    return {
      modelName: {
        type: String,
        value: ''
      },
      items: {
        type: Array,
        value: () => []
      }
    };
  }

  _getFilterInput(fieldName) {
    let fieldSchema = this._model.schema.getField(fieldName);
    console.log(fieldSchema);
    if (fieldSchema.type === 'string') {
      return html`
        <div>
          <label>${fieldSchema.label}</label>
          <input type="text" @keydown="${(e) => console.log(e.target.value)}" />
        </div>
      `;
    }
  }

  template() {
    if (!this.modelName) {
      return '';
    }
    return html`
      ${this.sharedStyles}
      <style>
        .filter-form {
          display: flex;
        }

        .filter-form > div {
          margin: 0 16px 16px 0;
          width: 200px;
        }
      </style>
      <div class="filter-form">
        ${this._model.schema.table && this._model.schema.table.filters ? this._model.schema.table.filters.map(this._getFilterInput.bind(this)) : ''}
      </div>

      <table class="standard">
        <tr>
          ${this._model.schema.table && this._model.schema.table.header
            ? this._model.schema.table.header.map(
                (fieldName) =>
                  html`
                    <th>${this._model.schema.getField(fieldName).label}</th>
                  `
              )
            : html`
                <th>Name</th>
              `}
          <th></th>
        </tr>
        ${this.items.map(
          (item) => html`
            <tr>
              ${this._model.schema.table && this._model.schema.table.header
                ? this._model.schema.table.header.map(
                    (fieldName) =>
                      html`
                        <td>${item.get(fieldName)}</td>
                      `
                  )
                : html`
                    <td>${this._itemName(item)}</td>
                  `}
              <td class="buttons"><a @click="${() => this._editDialog(item)}">${icons.edit}</a></td>
            </tr>
          `
        )}
      </table>

      <a class="standard" @click="${() => this._editDialog()}">Create new</a>
    `;
  }
  // href="/admin/models/${this.modelName}/${item._id}"

  get _model() {
    return this.models[this.modelName];
  }

  _itemName(item) {
    return item.name || item.shortname || item.shortName || item.short_name || item.fullname || item.fullName || item.full_name || item.title || item.text || item.value || item._id;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadItems();
  }

  async _loadItems() {
    this.items = await this._model.read();
  }

  _editDialog(item = {}) {
    let form = document.createElement('model-form');
    form.addEventListener('saved', () => this._loadItems());
    this.showDialog({
      title: `Edit ${this.modelName}`,
      el: Object.assign(form, {
        modelName: this.modelName,
        itemId: item._id
      }),
      externalStyles: html`
        <style>
          .wrapper {
            width: 90%;
            left: calc(5%);
          }
        </style>
      `
    });
  }
}
window.customElements.define('models-table', ModelsTable);
