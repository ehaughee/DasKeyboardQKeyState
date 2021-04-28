/* eslint-disable linebreak-style */
const q = require('daskeyboard-applet');
const cmk = require('control-modifier-keys');

const { logger } = q;

class KeyState extends q.DesktopApp {
  constructor() {
    super();
    KeyState.log('CTOR');

    this.keys = {
      NumLock: {
        code: 'numlock',
        display: 'Num Lock',
      },
      CapsLock: {
        code: 'capslock',
        display: 'Caps Lock',
      },
      ScrollLock: {
        code: 'scrolllock',
        display: 'Scroll Lock'
      }
    };

    KeyState.log('Key State ready to go!');
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    KeyState.log('Running...');

    this.pollingInterval = this.config.pollingInterval || 1000;
    this.colors = {
      on: this.config.colorOn || '#FF0000',
      off: this.config.colorOff || '#00FF00',
    };
    var key = this.config.key || this.keys.CapsLock.code;

    try {
      var enabled = cmk.getModifierState(key);
      KeyState.log(`${key} is ${enabled ? 'enabled' : 'disabled'}`);
      return new q.Signal({
        points: [
          [this.generatePoint(enabled)],
        ],
        name: `${key} State`,
        message: `${key} is ${enabled ? 'enabled' : 'disabled'}`,
      });    
    } catch(err){
      KeyState.log('error');
    }
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
