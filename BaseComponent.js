import { BaseComponent as _BaseComponent, html } from '../webcomponents-collection/BaseComponent.js';
import '../webcomponents-collection/ui/UiToast.js';
import '../webcomponents-collection/ui/UiDialog.js';
import { repeat } from '../lit-html/directives/repeat.js';

class BaseComponent extends _BaseComponent {
  get user() {
    return window.user;
  }

  get models() {
    return window.models;
  }

  changeInput(e) {
    let { name, value, checked } = e.target;
    if (e instanceof KeyboardEvent) {
      let target = e.path[0];
      name = target.name;
      value = target.value;
      checked = target.checked;
    }
    if (typeof checked === 'boolean' && value === 'on') {
      //value from checkbox
      value = checked;
    }
    if (name) {
      this.set(name, value);
    } else {
      console.error('field name required');
    }
  }

  showToast({ text, duration = 3000 }) {
    let toast = document.createElement('ui-toast');
    toast.innerHTML = text;
    let wrapperEl = document.body;
    wrapperEl.appendChild(toast);
    toast.show({ duration });
    setTimeout(() => {
      wrapperEl.removeChild(toast);
    }, duration + 1000); //делаем запас в секунду на анимацию закрывания
  }

  showDialog({ title, el, externalStyles }) {
    let wrapperEl = document.body;
    let dialog = Object.assign(document.createElement('ui-dialog'), { title, externalStyles });
    dialog.appendChild(el);
    wrapperEl.appendChild(dialog);
    dialog.open();
    return dialog;
  }

  get sharedStyles() {
    return html`
      <style>
        * {
          font-family: 'Roboto', serif;
        }

        [hidden] {
          display: none;
        }

        h1,
        h2,
        h3,
        h4,
        h5 {
          font-family: 'Roboto Slab', serif;
          color: #000;
          margin-top: 0;
        }

        h1 {
          line-height: 100%;
        }

        .row {
          display: flex;
        }
        .row > * {
          flex: 1;
        }
        .row .r {
          text-align: right;
        }

        * {
          font-family: 'Roboto', sans-serif;
        }
        a {
          color: #004ba0;
          text-decoration: underline;
          cursor: pointer;
        }

        .card {
          display: block;
          border-radius: 2px;
          background: #fff;
          border: 1px solid #ddd;
        }

        .card-content {
          padding: 16px;
        }
        /** Tables **************************************************************/
        table.standard {
          width: 100%;
          border-spacing: 0;
          border-collapse: seperate;
          overflow: hidden;
          border-radius: 2px;
          background: #fff;
          border: 1px solid #ddd;
          margin: 0 0 16px 0;
        }
        table.standard th {
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          height: 56px;
          padding: 0 12px;
          color: rgba(0, 0, 0, 0.54);
        }
        table.standard tr {
          height: 48px;
        }
        table.standard tr:hover {
          background: rgba(0, 0, 0, 0.02);
        }
        table.standard tr td {
          font-size: 13px;
          padding: 0 12px;
          border-top: 1px solid #ddd;
        }
        table.standard tr td .small {
          font-size: 10px;
          color: #ccc;
        }
        table.standard tr td.buttons {
          width: 1%;
          white-space: nowrap;
        }
        table.standard [numeric] {
          text-align: right;
        }
        table.standard .buttons a {
          text-decoration: none;
        }
        table.standard .buttons svg {
          width: 24px;
          height: 24px;
        }
        table.standard .buttons [disabled] svg {
          fill: #bbb;
        }
        /** Tables **************************************************************/
        a.standard,
        button.standard {
          font-size: 0.875rem;
          line-height: 2.25rem;
          font-weight: 500;
          text-decoration: none;
          text-transform: uppercase;
          will-change: transform, opacity;
          padding: 0 8px 0 8px;
          display: inline-flex;
          position: relative;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          min-width: 64px;
          height: 36px;
          border: none;
          outline: none;
          line-height: inherit;
          user-select: none;
          -webkit-appearance: none;
          overflow: hidden;
          vertical-align: middle;
          border-radius: 4px;
          color: #fff;
          background: #1976d2;
        }
        label {
          font-size: 15px;
          font-weight: 500;
          margin: 0 0 4px 0;
          display: block;
        }
        input:not([type='checkbox']):not([type='radio']):not([big]),
        textarea,
        select {
          box-sizing: border-box;
          background-color: #fff;
          border: 1px solid #ccc;
          padding: 0;
          margin: 0;
          border-radius: 0;
          -webkit-appearance: none;
          width: 100%;
          text-indent: 4px;
          font-size: 13px;
          border-radius: 2px;
        }
        input:not([type='checkbox']):not([type='radio']):not([big]),
        select {
          height: 32px;
          line-height: 32px;
        }
        input.pager {
          width: 100px !important;
          margin: 0 0 16px 0 !important;
        }
        fc-object {
          display: block;
          padding: 8px;
          margin: 0 0 8px 0;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
        }
        fc-object > label {
          font-size: 17px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        fc-primitive {
          display: block;
          margin: 0 0 8px 0;
        }

        fc-array .fc-array-item {
          position: relative;
          margin: 0 0 4px 0;
        }

        fc-array .fc-array-item-remove {
          position: absolute;
          top: 7px;
          right: 8px;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
        }
        fc-array .fc-array-item-add {
          display: inline-block;
          margin: 4px 0;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
        }
      </style>
    `;
  }
}

export { BaseComponent, html, repeat };
