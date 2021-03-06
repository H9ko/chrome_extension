import browser from 'webextension-polyfill';

const defaultId = 'Notification';
const defaultOptions = {
  type: 'basic',
  message: 'Default notification message',
  title: 'Default notification title',
  iconUrl: '../assets/128.png',
  eventTime: 23,
  buttons: [
    {
      title: 'Close button',
    },
    {
      title: 'Join button',
    },
  ],
};

export default class Notification {
  constructor(id = defaultId, options = defaultOptions) {
    this.id = id;
    this.options = options;
    this.notication = browser.notifications.create(id, options);
  }

  handleClick(type) {
    switch (type) {
      case 'close': {
        console.log('Notification closed = ', this.id);
        this.clear();
        break;
      }
      case 'join': {
        console.log('Notification JOIN button pressed = ', this.id);
        this.clear();
        break;
      }
      default:
        throw new Error('Unexpected click type = ', type);
    }
  }

  addListener() {
    browser.notifications.onButtonClicked.addListener((id, index) => {
      console.log('Id = ', id);
      console.log('Button = ', this.options.buttons[index]);
    });
  }

  clear() {
    browser.notifications.clear(this.id);
  }
}
