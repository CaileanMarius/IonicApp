import axios from 'axios';
import {getLogger} from '../core';
import {VideoGameProps} from './VideoGamesProps'

const log = getLogger('videoGameApi');

const baseUrl = 'localhost:3000';
const videogameUrl =`http://${baseUrl}/videogame`;

interface ResponseProps<T>{
    data: T;
}

function  withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T>{
    log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
    headers:{
        'Content-Type': 'application/json'
    }
};

export const getVideoGames: () => Promise<VideoGameProps[]> = () =>{
    return withLogs(axios.get(videogameUrl, config),'getVideoGames');
}

export const createVideoGame: (videogame: VideoGameProps) => Promise<VideoGameProps[]> = videogame => {
    return withLogs(axios.post(videogameUrl, videogame, config), 'createVideoGame');
  }
  
  export const updateVideoGame: (videogame: VideoGameProps) => Promise<VideoGameProps[]> = videogame => {
    return withLogs(axios.put(`${videogameUrl}/${videogame.id}`, videogame, config), 'updateVideoGame');
  }

  interface MessageData{
      event: string;
      payload: {
          videogame: VideoGameProps;
      };
  }

  export const newWebSocket = (onMessage: (data: MessageData) => void) =>{
     const ws = new WebSocket(`ws://${baseUrl}`)
     ws.onopen = () =>{
         log('web socket onopen');
     };
     ws.onclose = () =>{
         log('web socket onclose');
     };
     ws.onerror = error =>{
         log('web socket onerror ');
     };
     ws.onmessage = messageEvent =>
     {
         log('web socket onmessage');
         onMessage(JSON.parse(messageEvent.data));
     };
     return () =>{
         ws.close();
     }

  }