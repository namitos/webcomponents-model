import { BaseComponent, html, repeat } from '../BaseComponent.js';
import { icons } from '../icons.js';

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
        }
        models-tree-branch {
          width: 200px;
          max-height: 500px;
          overflow-y: auto;
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

export class ModelsTreeBranch extends BaseComponent {
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
        }
        .item .name {
          flex: 1;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item .buttons {
        }
        .item .buttons svg {
          width: 16px;
          height: 16px;
        }
        a {
          text-decoration: none;
        }
      </style>
      ${this.items.map(
        (item) => html`
          <div class="item">
            <a class="name" @click="${() => this.emit('branchClick', item)}">${this._itemName(item)}</a>
            <div class="buttons"><a>${icons.edit}</a><a>${icons.close}</a></div>
          </div>
        `
      )}
    `;
  }

  get _model() {
    return this.models[this.modelName];
  }

  _itemName(item) {
    return item.name || item.shortname || item.shortName || item.short_name || item.fullname || item.fullName || item.full_name || item.title || item.text || item.value || item._id;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.items = await this._model.read(
      this.branchId
        ? { parent: this.branchId }
        : {
            $or: [{ parent: { exists: false } }, { parent: '' }]
          }
    );
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

  async _deleteDialog(item) {
    if (this._model.schema.safeDelete) {
      if (item.deleted) {
        item.deleted = false;
        await item.save();
      } else {
        await item.delete();
      }
      this._loadItems();
    } else {
      if (confirm('Are you sure?')) {
        await item.delete();
        this._loadItems();
      }
    }
  }
}
window.customElements.define('models-tree-branch', ModelsTreeBranch);
