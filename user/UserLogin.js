import { BaseComponent, html } from '../BaseComponent.js';

export class UserLogin extends BaseComponent {
  static get properties() {
    return {
      form: {
        type: Object,
        value: () => {
          return {};
        }
      }
    };
  }

  template() {
    return html`
      ${this.sharedStyles}
      <style>
        .card {
          width: 300px;
          margin: 0 auto;
        }
        button {
          width: 100%;
        }
        input {
          margin: 0 0 8px 0 !important;
        }
      </style>
      <div class="card">
        <div class="card-content">
          <form @submit="${(e) => this.submit(e)}">
            <input name="form.username" @change="${this.changeInput.bind(this)}" required type="email" placeholder="email" />
            <input name="form.password" @change="${this.changeInput.bind(this)}" required minlength="6" type="password" placeholder="password" />
            <button class="standard">Login</button>
          </form>
        </div>
      </div>
    `;
  }

  async submit(e) {
    e.preventDefault();
    try {
      await api.post('auth/login', this.form);
      location.reload();
    } catch (err) {
      console.error(err);
    }
  }
}
window.customElements.define('user-login', UserLogin);
