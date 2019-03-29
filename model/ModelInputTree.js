import { BaseComponent, html } from '../BaseComponent.js';
import { widgets } from '../../fc/fc.js';

export class ModelInputTree extends BaseComponent {
  static get properties() {
    return {
      modelName: {
        type: String,
        value: ''
      },
      value: {
        type: String,
        value: '',
        noRender: true
      },
      placeholders: {
        type: Array,
        value: () => []
      },
      required: {
        type: Boolean
      },
      multiple: {
        type: Boolean
      },
      branches: {
        type: Array,
        value: () => [],
        noRender: true,
        observer() {
          this._selects = this.branches.map((items, i) => {
            items.sort((a, b) => {
              let n1 = a.title || a.name;
              let n2 = b.title || b.name;
              if (n1 > n2) {
                return 1;
              }
              if (n1 < n2) {
                return -1;
              }
              return 0;
            });
            items.sort((a, b) => (a.weight || 0) - (b.weight || 0));
            if (this.multiple) {
              throw 'multiple ModelInputTree not implemented';
            }
            return new widgets.FCSelect({
              required: this.required,
              items,
              value: items.value || this._defaultValue,
              onChange: this._onChange.bind(this),
              placeholder: this.placeholders[i] || ''
            });
            // return this.multiple
            //   ? new widgets.UiMultiSelect({
            //       required: this.required,
            //       items,
            //       value: items.value || this._defaultValue,
            //       onClose: this._onChange.bind(this),
            //       placeholder: this.placeholders[i] || '',
            //       showCloseButton: true
            //     })
            //   : new widgets.FCSelect({
            //       required: this.required,
            //       items,
            //       value: items.value || this._defaultValue,
            //       onChange: this._onChange.bind(this),
            //       placeholder: this.placeholders[i] || ''
            //     });
          });
        }
      },
      _selects: {
        type: Array,
        value: () => []
      }
    };
  }

  get _defaultValue() {
    return this.multiple ? [] : '';
  }

  get _model() {
    return this.models[this.modelName];
  }

  async connectedCallback() {
    super.connectedCallback();

    if (this.multiple) {
      if (!(this.value instanceof Array) && this.value) {
        this.value = [this.value];
      }
      if (!this.value) {
        this.value = [];
      }
    }
    this._model.breadcrumb(this.multiple ? this.value[0] || '' : this.value).then((breadcrumb) => {
      this.branch = breadcrumb[breadcrumb.length - 1]; //нужно для костыля
      let breadcrumbK = breadcrumb.keyBy('parent');
      let parentIds = [''];
      if (breadcrumb.length) {
        parentIds = breadcrumb.map((b) => b.parent);
        parentIds.push(breadcrumb[breadcrumb.length - 1]._id);
      }
      if (this.multiple && this.value.length > 1) {
        parentIds.pop();
      }

      this._model.read({ parent: { $in: parentIds } }, { sort: { weight: 1, title: 1 } }).then((r) => {
        let branchesG = r.groupBy('parent');
        let branches = [];
        parentIds.forEach((parentId, i) => {
          let items = branchesG[parentId];
          if (items) {
            items.parentId = parentId;
            items.breadcrumbNum = i;
            if (i === breadcrumb.length - 1) {
              items.value = this.value;
            } else {
              items.value = breadcrumbK[parentId] ? breadcrumbK[parentId]._id : '';
            }
            branches.push(items);
          }
        });
        this.branches = branches;
      });
    });
  }

  async _onChange(item) {
    try {
      let { value } = item;
      let branches = this.branches;
      branches[item.items.breadcrumbNum].value = value;
      if (branches.length > item.items.breadcrumbNum + 1) {
        branches = [...branches.slice(0, item.items.breadcrumbNum + 1)];
      }

      let loadChildren = (this.multiple && value.length === 1) || (!this.multiple && value);
      let hasValue = (this.multiple && value.length) || (!this.multiple && value);
      if (hasValue || item.items.breadcrumbNum === 0) {
        this.value = value;
      }
      let getPrevValue = !hasValue && item.items.breadcrumbNum > 0;
      if (getPrevValue) {
        //значение мультиселекта пустое - берём значение из предыдущего селекта
        this.value = this._selects[item.items.breadcrumbNum - 1].value;
      }
      let _value = this.multiple ? this.value[0] : this.value;
      this.branch = branches[branches.length - (getPrevValue ? 2 : 1)].find((branch) => branch._id === _value); //нужно для костыля

      if (loadChildren) {
        let b = await this._model.read({ parent: _value });
        if (b.length) {
          b.breadcrumbNum = item.items.breadcrumbNum + 1;
          branches.push(b);
        }
      }

      this.branches = [...branches];
    } catch (err) {
      console.error(err);
    }
  }

  template() {
    return html`
      ${this.sharedStyles}
      <style>
        :host > div {
          display: flex;
        }
      </style>
      <div>${this._selects.map((s) => s.el)}</div>
    `;
  }
}
window.customElements.define('model-input-tree', ModelInputTree);
