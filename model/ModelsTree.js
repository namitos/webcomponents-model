import { BaseComponent, html, repeat } from '../BaseComponent.js';
import { icons } from '../icons.js';
import ModelDialogsMixin from './ModelDialogsMixin.js';

export class ModelsTree extends BaseComponent {
  static get properties() {
    return {
      breadcrumb: {
        type: Array,
        value: () => []
      }
    };
  }

  template() {
    return html`
      <style>
        :host {
          display: flex;
          border: 1px solid #ddd;
          background: #fff;
        }
        models-tree-branch {
          width: 250px;
          overflow-y: auto;
          border-right: 1px solid #ddd;
        }
      </style>
      <models-tree-branch .modelName="${this.modelName}" @branchClick="${(e) => this._branchClick(e.detail, 0)}"></models-tree-branch>
      ${repeat(
        this.breadcrumb,
        (item) => item,
        (item, i) => html`
          <models-tree-branch .modelName="${this.modelName}" .branchId="${item}" @branchClick="${(e) => this._branchClick(e.detail, i + 1)}"></models-tree-branch>
        `
      )}
    `;
  }

  _branchClick(item, branchDepth) {
    let breadcrumb = this.breadcrumb.slice(0, branchDepth);
    breadcrumb.push(item._id);
    this.breadcrumb = breadcrumb;
  }
}
window.customElements.define('models-tree', ModelsTree);

export class ModelsTreeBranch extends ModelDialogsMixin(BaseComponent) {
  static get properties() {
    return {
      modelName: {
        type: String,
        value: ''
      },
      branchId: {
        type: String,
        value: ''
      },
      items: {
        type: Array,
        value: () => []
      }
    };
  }

  template() {
    if (!this.modelName) {
      return '';
    }
    return html`
      ${this.sharedStyles}
      <style>
        .item {
          display: flex;
          height: 24px;
          line-height: 24px;
          padding: 4px 8px;
        }
        .item .name {
          flex: 1;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .item .buttons {
          display: none;
        }
        .item:hover .buttons {
          display: block;
        }
        svg {
          width: 16px;
          height: 16px;
          vertical-align: sub;
        }
        a {
          text-decoration: none;
        }
      </style>
      <div class="item">
        <div class="name" @click="${() => this._editDialog(new this._model({ parent: this.branchId }))}">${icons.plus} New item</div>
      </div>
      ${this.items.map(
        (item) => html`
          <div class="item">
            <div class="name" @click="${() => this.emit('branchClick', item)}">${this._itemName(item)}</div>
            <div class="buttons"><a @click="${() => this._editDialog(item)}">${icons.edit}</a><a @click="${() => this._deleteDialog(item)}">${icons.close}</a></div>
          </div>
        `
      )}
    `;
  }

  get _model() {
    return this.models[this.modelName];
  }

  async connectedCallback() {
    super.connectedCallback();
    this._loadItems();
  }

  async _loadItems() {
    this.items = await this._model.read(
      this.branchId
        ? { parent: this.branchId }
        : {
            $or: [{ parent: { exists: false } }, { parent: '' }]
          }
    );
  }
}
window.customElements.define('models-tree-branch', ModelsTreeBranch);
