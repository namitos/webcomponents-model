import { BaseComponent, html, repeat } from '../BaseComponent.js';
import { icons } from '../icons.js';
import '../../webcomponents-collection/ui/UiPager.js';
import ModelDialogsMixin from './ModelDialogsMixin.js';
import './ModelForm.js';

export class ModelsTable extends ModelDialogsMixin(BaseComponent) {
  static get properties() {
    return {
      modelName: {
        type: String,
        value: ''
      },
      items: {
        type: Array,
        value: () => []
      },
      limit: {
        type: Number,
        value: 20
      },
      skip: {
        type: Number,
        value: 0
      },
      page: {
        type: Number,
        value: 0
      },
      pagesCount: {
        type: Number,
        value: 0
      },
      filterForm: {
        type: Object,
        value: () => {
          return {};
        }
      }
    };
  }

  _getFilterInput(fieldName) {
    let fieldSchema = this._model.schema.getField(fieldName);
    if (fieldSchema.type === 'string') {
      return html`
        <div>
          <label>${fieldSchema.label}</label>
          <input type="text" name="filterForm.${fieldName}" @keyup="${(e) => this._changeFilterInput(e)}" />
        </div>
      `;
    }
  }

  _changeFilterInput(e) {
    this.changeInput(e);
    this._loadItems();
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
        ${this._model.schema.table && this._model.schema.table.filters ? repeat(this._model.schema.table.filters, (fieldName) => fieldName, this._getFilterInput.bind(this)) : ''}
      </div>

      <ui-pager .page="${this.page}" .pagesCount="${this.pagesCount}" @page-changed="${(e) => this._pageChanged(e.detail)}"></ui-pager>

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
              <td class="buttons">
                <a @click="${() => this._editDialog(item)}">${icons.edit}</a>
                ${this._model.schema.safeDelete
                  ? html`
                      <a @click="${() => this._deleteDialog(item)}">${item.deleted ? icons.restore : icons.trash}</a>
                    `
                  : html`
                      <a @click="${() => this._deleteDialog(item)}">${icons.close}</a>
                    `}
              </td>
            </tr>
          `
        )}
      </table>

      <ui-pager .page="${this.page}" .pagesCount="${this.pagesCount}" @page-changed="${(e) => this._pageChanged(e.detail)}"></ui-pager>

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

  _pageChanged(page) {
    this.page = page;
    this._loadItems();
  }

  async _loadItems() {
    let where = {};
    Object.keys(this.filterForm).forEach((fieldName) => {
      if (this.filterForm[fieldName]) {
        let fieldSchema = this._model.schema.getField(fieldName);
        if (fieldSchema.type === 'string') {
          where[fieldName] = {
            $regex: this.filterForm[fieldName],
            $options: 'i'
          };
        }
      }
    });

    let options = {
      skip: this.page * this.limit,
      limit: this.limit
    };
    let [items, count] = await Promise.all([
      //
      this._model.read(where, options),
      this._model.count(where)
    ]);
    Object.assign(this, {
      items,
      pagesCount: Math.ceil(count / this.limit)
    });
  }
}
window.customElements.define('models-table', ModelsTable);
