import { html } from '../BaseComponent.js';

export default (base) =>
  class extends base {
    _itemName(item) {
      return item.title || item.name || item.shortname || item.shortName || item.short_name || item.fullname || item.fullName || item.full_name || item.text || item.value || item._id;
    }

    _editDialog(item = {}) {
      let form = document.createElement('model-form');
      form.addEventListener('saved', () => this._loadItems());
      this.showDialog({
        title: `Edit ${this.modelName}`,
        el: Object.assign(form, {
          modelName: this.modelName,
          itemId: item._id,
          item
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
  };
