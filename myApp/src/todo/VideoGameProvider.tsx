import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { VideoGameProps } from './VideoGamesProps';
import { createVideoGame, getVideoGames, updateVideoGame, newWebSocket, eraseVideoGame, getVideoGame } from './videoGameApi';
import { AuthContext } from '../auth';

import {Plugins} from "@capacitor/core";
import VideoGame from "./VideoGame";
const {Storage} = Plugins;

const log = getLogger('VideoGameProvider');

type SaveVideoGameFn = (videogame: VideoGameProps, connected: boolean) => Promise<any>;
type DeleteVideoGameFn = (videogame: VideoGameProps, connected: boolean) => Promise<any>;
type UpdateServerFn = () => Promise<any>;
type ServerVideoGame = (id: string, version: number) => Promise<any>;

export interface VideoGamesState {
  videogames?: VideoGameProps[],
  oldVideoGame?: VideoGameProps,
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  deleting: boolean,
  savingError?: Error | null,
  deletingError?: Error | null,
  saveVideoGame?: SaveVideoGameFn,
  deleteVideoGame?: DeleteVideoGameFn,
  updateServer?: UpdateServerFn,
  getServerVideoGame?: ServerVideoGame,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: VideoGamesState = {
  fetching: false,
  saving: false,
  deleting: false, 
  oldVideoGame: undefined,
};

const FETCH_VIDEOGAMES_STARTED = 'FETCH_VIDEOGAMES_STARTED';
const FETCH_VIDEOGAMES_SUCCEEDED = 'FETCH_VIDEOGAMES_SUCCEEDED';
const FETCH_VIDEOGAMES_FAILED = 'FETCH_VIDEOGAMES_FAILED';

const SAVE_VIDEOGAMES_STARTED = 'SAVE_VIDEOGAMES_STARTED';
const SAVE_VIDEOGAMES_SUCCEEDED = 'SAVE_VIDEOGAMES_SUCCEEDED';
const SAVE_VIDEOGAME_SUCCEEDED_OFFLINE = "SAVE_VIDEOGAME_SUCCEEDED_OFFLINE";
const SAVE_VIDEOGAMES_FAILED = 'SAVE_VIDEOGAMES_FAILED';

const DELETE_VIDEOGAME_STARTED = "DELETE_VIDEOGAME_STARTED";
const DELETE_VIDEOGAME_SUCCEEDED = "DELETE_VIDEOGAME_SUCCEEDED";
const DELETE_VIDEOGAME_FAILED = "DELETE_VIDEOGAME_FAILED";

const CONFLICT_SOLVED = "CONFLICT_SOLVED";

const reducer: (state: VideoGamesState, action: ActionProps) => VideoGamesState =
  (state, { type, payload }) => {
    switch(type) {
      //fetching
      case FETCH_VIDEOGAMES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_VIDEOGAMES_SUCCEEDED:
        return { ...state, videogames: payload.videogames, fetching: false };
      case FETCH_VIDEOGAMES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };

      //saving  
      case SAVE_VIDEOGAMES_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_VIDEOGAMES_SUCCEEDED:
        const videogames = [...(state.videogames || [])];
        const videogame = payload.videogame;
        if(videogame._id !== undefined)
        {
          const index = videogames.findIndex(it => it._id === videogame._id);
          if (index === -1) {
            videogames.splice(0, 0, videogame);
          } else {
            videogames[index] = videogame;
          }
          return { ...state,  videogames, saving: false };
      }
      case SAVE_VIDEOGAME_SUCCEEDED_OFFLINE:{
        const videogames = [...(state.videogames || [])];
        const videogame = payload.videogame;
        const index = videogames.findIndex((it) => it._id === videogame._id);
        if (index === -1) {
            videogames.splice(0, 0, videogame);
        } else {
            videogames[index] = videogame;
        }
        return { ...state, videogames, saving: false };
      }
      case SAVE_VIDEOGAMES_FAILED:
        return { ...state, savingError: payload.error, saving: false };

    case DELETE_VIDEOGAME_STARTED:
      return { ...state, deletingError: null, deleting: true };
    case DELETE_VIDEOGAME_SUCCEEDED: {
      const videogames = [...(state.videogames || [])];
      const videogame = payload.videogame;
      const index = videogames.findIndex((it) => it._id === videogame._id);
      videogames.splice(index, 1);
      return { ...state, videogames, deleting: false };
    }

    case DELETE_VIDEOGAME_FAILED:
      return { ...state, deletingError: payload.error, deleting: false };


      //conflicts
    //   case CONFLICT: {
    //     log("CONFLICT: " + JSON.stringify(payload.videogame));
    //     return { ...state, oldVideoGame: payload.videogame };
    // }
    // case CONFLICT_SOLVED: {
    //     log("CONFLICT_SOLVED");
    //     return { ...state, oldVideoGame: undefined };
    // }
    
    default:
        return state;
    }
  };

export const VideoGameContext = React.createContext<VideoGamesState>(initialState);

interface VideoGameProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const VideoGameProvider: React.FC<VideoGameProviderProps> = ({ children }) => {
  const {token} = useContext(AuthContext)
  const [state, dispatch] = useReducer(reducer, initialState);
  const { videogames, fetching, fetchingError, saving, savingError, deleting, oldVideoGame } = state;

  useEffect(getVideoGamesEffect, [token]);
  useEffect(wsEffect, [token]);

  const saveVideoGame = useCallback<SaveVideoGameFn>(saveVideoGameCallback, [token]);
  const deleteVideoGame = useCallback<DeleteVideoGameFn>(deleteVideoGameCallBack, [token]);
  const updateServer = useCallback<UpdateServerFn>(updateServerCallback, [token]);
  const getServerVideoGame = useCallback<ServerVideoGame>(getServerVideoGameCallback, [token]);


  const value = { videogames, fetching, fetchingError, saving, savingError, saveVideoGame, deleting, deleteVideoGame, updateServer, getServerVideoGame, oldVideoGame };
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
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchVideoGames started');
        dispatch({ type: FETCH_VIDEOGAMES_STARTED });
        const videogames = await getVideoGames(token);
        log('fetchVideoGames succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_VIDEOGAMES_SUCCEEDED, payload: { videogames } });
        }
      } catch (error) {
        //no network, grab the videogames from local storage
        log('fetchIVideoGames failed');
        //dispatch({ type: FETCH_VIDEOGAMES_FAILED, payload: { error } });


        const allKeys = Storage.keys();
        console.log(allKeys);
        let promisedVideoGames;
        var i;

        promisedVideoGames = await allKeys.then(function (allKeys) {
          const promises =[];
          for(i = 0;i<allKeys.keys.length;i++){
            const promiseVideoGame = Storage.get({key: allKeys.keys[i]});
            promises.push(promiseVideoGame);
          }
          return promises;
        });

        const allVideoGames =[];
        for(i = 0;i < promisedVideoGames.length;i++){
          const promise = promisedVideoGames[i];
          const videog = await promise.then(function (it) {
            var object;
            try{
              object = JSON.parse(it.value!);
            }catch(e){
              return null;
            }
            console.log(typeof object);
            console.log(object);
            if(object.status !== 2){
              return object;
            }
            return null;
          });
          if(videog != null){
            allVideoGames.push(videog);
          }
        }

        const videogames = allVideoGames;
        dispatch({ type: FETCH_VIDEOGAMES_SUCCEEDED, payload: { videogames } });
      }

    }
  }

  async function saveVideoGameCallback(videogame: VideoGameProps, connected: boolean) {
    try {
      
      log("COnectat?")
      console.log(connected);
      if(!connected){
        throw new Error();
      }
      log('saveVideoGame started');
      dispatch({ type: SAVE_VIDEOGAMES_STARTED });
      const savedVideoGame = await (videogame._id ? updateVideoGame(token,videogame) : createVideoGame(token,videogame));
      log('saveVideoGame succeeded');
      dispatch({ type: SAVE_VIDEOGAMES_SUCCEEDED, payload: { videogame: savedVideoGame } });
      dispatch({ type: CONFLICT_SOLVED });
    } catch (error) {
      log('saveVideoGamefailed with err: ', error);

      if(videogame._id === undefined){
        videogame._id = generateRandomID()
        videogame.status = 1;
        alert("Videogame saved locally");
      }
      else {
        videogame.status = 2;
        alert("Videogame updated locally");
      }
      await Storage.set({key: videogame._id, value: JSON.stringify(videogame),});


      dispatch({ type: SAVE_VIDEOGAME_SUCCEEDED_OFFLINE, payload: { videogame: videogame } });
    }
  }



  async function deleteVideoGameCallBack(videogame: VideoGameProps, connected: boolean) {
    
    try{
      if(!connected){
        throw new Error();
      }
      dispatch({type: DELETE_VIDEOGAME_STARTED});
      const deletedVideoGame = await eraseVideoGame(token, videogame);
      console.log(deleteVideoGame);
      await Storage.remove({key: videogame._id!});
      dispatch({type: DELETE_VIDEOGAME_SUCCEEDED, payload: {videogame: videogame}});

    }catch(error){
      videogame.status = 3;
      await Storage.set({key: JSON.stringify(videogame._id), value: JSON.stringify(videogame),});
      alert("Videogame deleted locally");
      dispatch({ type: DELETE_VIDEOGAME_SUCCEEDED, payload: {videogame: videogame}});
    }

  }


  async function updateServerCallback(){

    //grab videogames from local storage
    const allKeys = Storage.keys();
    let promisedVideoGames;
    var i;

    promisedVideoGames = await allKeys.then(function (allKeys) {
      const promises =[]
      for( i=0;i<allKeys.keys.length;i++){
        const promiseVideoGame = Storage.get({key: allKeys.keys[i]});
        promises.push(promiseVideoGame)
      }
      return promises;
    });


    for(i=0;i<promisedVideoGames.length;i++){

      const promise = promisedVideoGames[i];
      const videogame = await promise.then(function(it){
          var object;
          try{
            object = JSON.parse(it.value!);
          }catch(e){
            return null;
          }
          return object;
      });

      if(videogame !== null){

        if(videogame.status === 1){
          dispatch({type: DELETE_VIDEOGAME_SUCCEEDED, payload: {videogame: videogame}});
          await Storage.remove({key: videogame._id});
          const oldVideoGame = videogame;
          delete oldVideoGame._id;
          oldVideoGame.status = 0;
          const newVideoGame = await createVideoGame(token, oldVideoGame);
          dispatch({type: SAVE_VIDEOGAMES_SUCCEEDED, payload: {videogame: newVideoGame}});
          await Storage.set({key: JSON.stringify(newVideoGame._id), value: JSON.stringify(newVideoGame),});
        }
        //has ti be updated
        else if(videogame.status === 2){
            videogame.status = 0;
            const newVideoGame = await updateVideoGame(token, videogame);
            dispatch({ type: SAVE_VIDEOGAMES_SUCCEEDED, payload: { videogame: newVideoGame } });
            await Storage.set({
              key: JSON.stringify(newVideoGame._id), 
              value: JSON.stringify(newVideoGame),
            })
            
        }
        //deleted
        else if(videogame.status === 3){
            videogame.status = 0;
            await eraseVideoGame(token, videogame);
            await Storage.remove({key: videogame._id});
        }
      }
    }
  }

  async function getServerVideoGameCallback(id: string, version: number) {
    // ifoldVideoGame's version isnt the same with the curent version => conflict
    const oldVideoGame = await getVideoGame(token, id);
    console.log("OLD VIDEOGAME");
    console.log(oldVideoGame);
    console.log("OLD VIDEOGANE VERSION:")
    
    
  }



  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if(token?.trim()) {
      closeWebSocket = newWebSocket(token,(message) => {
        if (canceled) {
          return;
        }
        const { type, payload: videogame } = message;
        log(`ws message, carte ${type} ${videogame._id}`);
        if (type === 'created' || type === 'updated') {
          //dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {carte} });
        }
      });
      return () => {
        log('wsEffect - disconnecting');
        canceled = true;
        closeWebSocket?.();
      }
    }
  }


  //generates random id for storing product locally
  function generateRandomID() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

};


