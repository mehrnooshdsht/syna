class Stream {
  constructor() {
    this._topics = {};
    this.subUid = -1;
    this.subscribe = this.subscribe.bind(this);
    this.publish = this.publish.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  subscribe (topic, func) {
    if (!this._topics[topic]) {
      this._topics[topic] = [];
    }
    const token = (++this.subUid).toString();
    this._topics[topic].push({ token, func });
    return token;
  }

  publish(topic, argsText) {
    if (!this._topics[topic]) {
      return false;
    }
    setTimeout(() => {
      const subscribers = this._topics[topic];
      const args = argsText
        .split(',')
        .reduce((tmp, param) => {
          const [key, value] = param.split(':');
          tmp[key] = value;
          return tmp;
        }, {});

      let len = subscribers ? subscribers.length : 0;
      while (len--) {
        subscribers[len].func.call(null, args);
      }
    }, 0);
    return true;
  }

  unsubscribe(token) {
    for (const topic in this._topics) {
      if (this._topics[topic]) {
        for (let i = 0, j = this._topics[topic].length; i < j; i++) {
          if (this._topics[topic][i].token === token) {
            this._topics[topic].splice(i, 1);
            return token;
          }
        }
      }
    }
    return false;
  }
}

class SynaAPI {
  constructor() {
    this._registry = {}
    this.register = this.register.bind(this);
    this.update = this.update.bind(this);
    this.get = this.get.bind(this);
    this.getScope = this.getScope.bind(this);
    this.toArray = this.toArray.bind(this);
  }

  register(scope, id, value) {
    if (!this._registry[scope]) {
      this._registry[scope] = {};
    }

    this._registry[scope][id] = value;
  }

  update(scope, id, value) {
    if (!this._registry[scope] || !this._registry[scope][id]) {
      return null;
    }

    this._registry[scope][id] = value;
    return value;
  }

  get(scope, id) {
    if (!this._registry[scope]) {
      return null;
    }

    return this._registry[scope][id]
  }

  getScope(scope) {
    return this._registry[scope];
  }

  toArray(scope) {
    if (!this._registry[scope]) {
      return null;
    }

    return Object.values(this._registry[scope]);
  }
}

window.syna = {
  api: new SynaAPI(),
  stream: new Stream(),
};
window.synaPortals = {};
