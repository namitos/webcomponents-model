import { ArrayMixin } from '../../frontend-common/ArrayMixin.js';
import { HttpTransport } from '../../frontend-common/HttpTransport.js';
import { Router } from '../../frontend-common/Router.js';
import { initModels } from '../../frontend-common/initModels.js';

import './AppShell.js';
import '../model/ModelsTable.js';
import '../model/ModelsTree.js';
import '../model/ModelForm.js';
import '../user/UserLogin.js';

let am = new (ArrayMixin(class {}))();
Object.assign(Array.prototype, { keyBy: am.keyBy, groupBy: am.groupBy });


export async function start({apiHost }){
window.apiHost =apiHost || `${location.protocol}//${location.host}`;
window.api = new HttpTransport(`${window.apiHost}/api`);

  let initData = await window.api.r('init');
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
        let Model = window.models[params.modelName];
        let { tree } = Model.schema;
        window.appShell.setContent({
          title: params.modelName,
          el: Object.assign(document.createElement(tree ? 'models-tree' : 'models-table'), params)
        });
      }
    });
  } else {
    document.body.appendChild(document.createElement('user-login'));
  }
}
