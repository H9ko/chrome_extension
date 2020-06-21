/* eslint-disable camelcase */
const browser = require('webextension-polyfill');

const socket = new WebSocket('wss://codebattle.hexlet.io/extension/websocket?vsn=2.0.0');
let popup;
const postMessage = msg => popup && popup.postMessage(msg);
const setBadge = text => browser.browserAction.setBadgeText({ text });
const getCountGames = ({ games: { active_games } }) => (
  active_games.length
);
const state = {
  games: {},
  user: {},
  info: {},
};

browser.runtime.onConnect.addListener(port => {
  popup = port;

  popup.onMessage.addListener(msg => {
    if (msg.action === 'getState') {
      popup.postMessage({ ...state });
    }
  });
  popup.onDisconnect.addListener(dsc => {
    console.log('Port disconnected = ', dsc);
    popup = null;
  });
});

const getLobby = () => socket.send(JSON.stringify(['7', '7', 'lobby', 'phx_join', {}]));
const ping = () => socket.send(JSON.stringify([null, '8', 'phoenix', 'heartbeat', {}]));
socket.onopen = () => {
  setInterval(ping, 6000);
  getLobby();
};
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  const [, , channel, phx_reply, info] = message;
  if (channel === 'lobby') {
    console.log('Current State = ', state);
    console.log('Message = ', message);
    try {
      switch (phx_reply) {
        case 'phx_reply': {
          state.games.active_games = info.response.active_games.filter(game => !game.is_bot);
          setBadge(`${getCountGames(state)}`);
          postMessage(state);
          break;
        }
        case 'game:upsert': {
          if (!info.game.is_bot) {
            state.games.active_games = [...state.games.active_games, info.game];
          }
          setBadge(`${getCountGames(state)}`);
          postMessage(state);
          break;
        }
        case 'game:finish':
        case 'game:remove': {
          const { id } = info;
          state.games.active_games = state.games.active_games.filter(game => game.id !== id);
          setBadge(`${getCountGames(state)}`);
          postMessage(state);
          break;
        }
        default:
          throw new Error(`Unexpected response type: ${phx_reply}`);
      }
    } catch (err) {
      console.log(`Error in bg: ${err}`);
    }
  }
  console.log('Next State = ', state);
};
socket.onerror = error => { console.log('WS got error = ', error); };
socket.onclose = dsc => { console.log('WS disconnected ', dsc); };