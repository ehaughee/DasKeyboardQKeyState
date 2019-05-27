/* eslint-disable linebreak-style */
const q = require('daskeyboard-applet');
const Shell = require('node-powershell');

const { logger } = q;

class KeyState extends q.DesktopApp {
  constructor() {
    super();
    KeyState.log('CTOR');
    this.pollingInterval = 1000;

    this.colors = {
      on: this.config.colorOn || '#FF0000',
      off: this.config.colorOff || '#00FF00',
    };

    this.keys = {
      NumLock: {
        code: 'NumberLock',
        display: 'Num Lock',
      },
      CapsLock: {
        code: 'CapsLock',
        display: 'Caps Lock',
      },
    };

    KeyState.log('Key State ready to go!');
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    KeyState.log('Running...');
    const key = this.config.key || this.keys.CapsLock.code;
    return KeyState.getKeyStatus(key)
      .then((status) => {
        const enabled = status === 'True';
        return new q.Signal({
          points: [
            [this.generatePoint(enabled)],
          ],
          name: `${key} State`,
          message: `${key} is ${enabled ? 'enabled' : 'disabled'}`,
        });
      }).catch((err) => {
        // TODO: Introduce an error signal
        // https://www.daskeyboard.io/applet-development/signals#signal-options
        KeyState.log(err, 'error');
      });
  }

  // eslint-disable-next-line class-methods-use-this
  async options(questionKey) {
    switch (questionKey) {
      case 'key':
        return Object.values(this.keys).map(val => ({
          key: val.code,
          value: val.display,
        }));
      default:
        throw new Error(`Unsupported questionKey: ${questionKey}`);
    }
  }

  static async getKeyStatus(key) {
    KeyState.log(`Getting ${key} key status...`);
    return new Promise((resolve) => {
      const ps = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true,
      });

      ps.addCommand(`[console]::${key}`);
      ps.invoke()
        .then((output) => {
          KeyState.log(`Got ${key} key status: ${output.trim()}`);
          ps.dispose();
          resolve(output.trim());
        })
        .catch((err) => {
          ps.dispose();
          throw err;
        });
    });
  }

  generatePoint(on) {
    return new q.Point(on ? this.colors.on : this.colors.off);
  }

  static log(msg, level) {
    const prefix = '[KeyState]';
    const prefixedMessage = `${prefix} ${msg}`;
    if (level === 'error') {
      logger.error(prefixedMessage);
    } else {
      logger.info(prefixedMessage);
    }
  }
}

module.exports = {
  KeyState,
};

// eslint-disable-next-line no-unused-vars
const keyState = new KeyState();
