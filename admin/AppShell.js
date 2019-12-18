import { BaseComponent, html } from '../BaseComponent.js';

export class AppShell extends BaseComponent {
  static get properties() {
    return {
      title: {
        type: String
      },
      modelNames: {
        type: Array,
        value: () => []
      }
    };
  }

  template() {
    return html`
      ${this.sharedStyles}
      <style>
        :host {
          display: block;
          height: 100%;
          width: 100%;
        }
        .layout {
          display: flex;
          width: 100%;
          height: 100%;
        }
        .layout .r {
          flex: 1;
          padding: 16px;
          overflow: auto;
          display: flex;
          flex-direction: column;
        }
        #content {
          box-sizing: border-box;
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        #content > * {
          width: 100%;
        }
        #sidebar {
          background: #444;
          width: 256px;
          overflow: auto;
        }
        #sidebar a {
          color: #fff;
          display: block;
          text-decoration: none;
          padding: 0 16px;
          height: 48px;
          line-height: 48px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
      <div class="layout">
        <div id="sidebar">
          ${this.modelNames.map(
            (modelName) =>
              html`
                <a href="/admin/models/${modelName}">${modelName}</a>
              `
          )}
        </div>
        <div class="r">
          <h1>${this.title}</h1>
          <div id="content"></div>
        </div>
      </div>
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    this.modelNames = Object.keys(window.models).filter((modelName) => !['Model', 'Tree', 'Schema'].includes(modelName) && this.user.permission(`${modelName} read`));
  }

  async setContent(data = {}) {
    await this.nextTick();
    this.title = data.title;
    let content = this._content.querySelector('#content');
    content.innerHTML = '';
    content.appendChild(data.el);
  }
}
window.customElements.define('app-shell', AppShell);
