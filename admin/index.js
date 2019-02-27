import { ArrayMixin } from '../../frontend-common/ArrayMixin.js';
import { HttpTransport } from '../../frontend-common/HttpTransport.js';
import { Router } from '../../frontend-common/Router.js';
import { initModels } from '../../frontend-common/initModels.js';

import './AppShell.js';
import '../model/ModelsTable.js';
import '../model/ModelForm.js';
import '../user/UserLogin.js';

let am = new (ArrayMixin(class {}))();
Object.assign(Array.prototype, { keyBy: am.keyBy, groupBy: am.groupBy });

window.apiHost = `${location.protocol}//${location.host}`;

window.err = function(err) {
  //util.notify(err && err.stack ? err.stack : err, 1000000);
  console.error(err, err.stack ? err.stack : '');
};
window.api = new HttpTransport(`${window.apiHost}/api`);

/**
 * @returns {Object} init data
 */
async function init() {
  let initDataEl = document.getElementById('prerenderdata-init');
  return initDataEl ? JSON.parse(initDataEl.innerHTML) : window.api.r('init');
}

(async () => {
  let initData = await init();
  let models = initModels({
    schemas: initData.schemas,
    apiHost: window.apiHost
  });
  // extendModels({ models, schemas: initData.schemas });
  window.models = models;

  window.user = new models.User(initData.user);

  if (window.user._id) {
    window.appShell = document.createElement('app-shell');
    document.body.appendChild(window.appShell);
    window.router = new Router({
      '/admin': () => {
        setTimeout(() => {
          window.router.navigate('/admin/models');
        });
      },
      '/admin/models': async () => {},
      '/admin/models/:modelName': async (params) => {
        window.appShell.setContent({
          title: params.modelName,
          el: Object.assign(document.createElement('models-table'), params)
        });
      }
    });
  } else {
    document.body.appendChild(document.createElement('user-login'));
  }
})();
