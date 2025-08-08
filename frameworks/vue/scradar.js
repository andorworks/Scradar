import Scradar from '../../src/scradar.js';

export default {
  install(app, globalOptions = {}) {
    // Vue 3 directive
    app.directive('scradar', {
      mounted(el, binding) {
        const options = { ...globalOptions, ...binding.value };
        el.__scradar_instance = new Scradar(el, options);
      },
      updated(el, binding) {
        if (el.__scradar_instance) {
          el.__scradar_instance.update();
        }
      },
      unmounted(el) {
        if (el.__scradar_instance) {
          el.__scradar_instance.destroy();
          delete el.__scradar_instance;
        }
      }
    });
    
    // Global property
    app.config.globalProperties.$scradar = Scradar;
  }
};

// Vue 2 compatibility
export const ScradarVue2 = {
  install(Vue, globalOptions = {}) {
    Vue.directive('scradar', {
      bind(el, binding) {
        const options = { ...globalOptions, ...binding.value };
        el.__scradar_instance = new Scradar(el, options);
      },
      update(el) {
        if (el.__scradar_instance) {
          el.__scradar_instance.update();
        }
      },
      unbind(el) {
        if (el.__scradar_instance) {
          el.__scradar_instance.destroy();
          delete el.__scradar_instance;
        }
      }
    });
    
    Vue.prototype.$scradar = Scradar;
  }
};
