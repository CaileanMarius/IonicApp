import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { VideoGameProps } from './VideoGamesProps';
import { createVideoGame, getVideoGames, updateVideoGame, newWebSocket } from './videoGameApi';

const log = getLogger('VideoGameProvider');

type SaveVideoGameFn = (videogame: VideoGameProps) => Promise<any>;

export interface VideoGamesState {
  videogames?: VideoGameProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveVideoGame?: SaveVideoGameFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: VideoGamesState = {
  fetching: false,
  saving: false,
};

const FETCH_VIDEOGAMES_STARTED = 'FETCH_VIDEOGAMES_STARTED';
const FETCH_VIDEOGAMES_SUCCEEDED = 'FETCH_VIDEOGAMES_SUCCEEDED';
const FETCH_VIDEOGAMES_FAILED = 'FETCH_VIDEOGAMES_FAILED';
const SAVE_VIDEOGAMES_STARTED = 'SAVE_VIDEOGAMES_STARTED';
const SAVE_VIDEOGAMES_SUCCEEDED = 'SAVE_VIDEOGAMES_SUCCEEDED';
const SAVE_VIDEOGAMES_FAILED = 'SAVE_VIDEOGAMES_FAILED';

const reducer: (state: VideoGamesState, action: ActionProps) => VideoGamesState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_VIDEOGAMES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_VIDEOGAMES_SUCCEEDED:
        return { ...state, videogames: payload.videogames, fetching: false };
      case FETCH_VIDEOGAMES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_VIDEOGAMES_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_VIDEOGAMES_SUCCEEDED:
        const videogames = [...(state.videogames || [])];
        const videogame = payload.videogame;
        const index = videogames.findIndex(it => it.id === videogame.id);
        if (index === -1) {
          videogames.splice(0, 0, videogame);
        } else {
          videogames[index] = videogame;
        }
        return { ...state,  videogames, saving: false };
      case SAVE_VIDEOGAMES_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const VideoGameContext = React.createContext<VideoGamesState>(initialState);

interface VideoGameProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const VideoGameProvider: React.FC<VideoGameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { videogames, fetching, fetchingError, saving, savingError } = state;
  useEffect(getVideoGamesEffect, []);
  useEffect(wsEffect, []);
  const saveVideoGame = useCallback<SaveVideoGameFn>(saveVideoGameCallback, []);
  const value = { videogames, fetching, fetchingError, saving, savingError, saveVideoGame };
  log('returns');
  return (
    <VideoGameContext.Provider value={value}>
      {children}
    </VideoGameContext.Provider>
  );

  function getVideoGamesEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try {
        log('fetchVideoGames started');
        dispatch({ type: FETCH_VIDEOGAMES_STARTED });
        const videogames = await getVideoGames();
        log('fetchVideoGames succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_VIDEOGAMES_SUCCEEDED, payload: { videogames } });
        }
      } catch (error) {
        log('fetchIVideoGames failed');
        dispatch({ type: FETCH_VIDEOGAMES_FAILED, payload: { error } });
      }
    }
  }

  async function saveVideoGameCallback(videogame: VideoGameProps) {
    try {
      log('saveVideoGame started');
      dispatch({ type: SAVE_VIDEOGAMES_STARTED });
      const savedVideoGame = await (videogame.id ? updateVideoGame(videogame) : createVideoGame(videogame));
      log('saveVideoGame succeeded');
      dispatch({ type: SAVE_VIDEOGAMES_SUCCEEDED, payload: { videogame: savedVideoGame } });
    } catch (error) {
      log('saveVideoGamefailed');
      dispatch({ type: SAVE_VIDEOGAMES_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { videogame }} = message;
      log(`ws message, videogame ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_VIDEOGAMES_SUCCEEDED, payload: { videogame } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }

};
