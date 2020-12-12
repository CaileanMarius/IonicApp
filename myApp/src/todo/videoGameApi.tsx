import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import {VideoGameProps} from './VideoGamesProps'

import {Plugins} from "@capacitor/core";
const {Storage} = Plugins;

const videogameUrl =`http://${baseUrl}/api/videogame`;

export const getVideoGames: (token: string) => Promise<VideoGameProps[]> = token =>{
    
    var result = axios.get(videogameUrl, authConfig(token));
    result.then(function(result){
      result.data.forEach(async (videogame: VideoGameProps) => {
        await Storage.set({
          key: videogame._id!,
          value: JSON.stringify({
            videogame
          }),
        });
      });
    });
    return withLogs(result, "getVideoGames");

}


export const getVideoGame: (token: string, id: string) => Promise<VideoGameProps> = (token, id) =>{
  var result = axios.get(`${videogameUrl}/${id}`, authConfig(token))
  return withLogs(result, "getVideoGame");
}


export const createVideoGame: (token: string, videogame: VideoGameProps) => Promise<VideoGameProps> = (token,videogame) => {
  var result = axios.post(videogameUrl, videogame,  authConfig(token));
    result.then( async function(result){
      var videogame = result.data;
      await Storage.set({
        key: videogame._id!,
        value: JSON.stringify({
          videogame
        }),
      });
    });
    return withLogs(result, "createVideoGame");
 //   return withLogs(axios.post(videogameUrl, videogame, authConfig(token)), 'createVideoGame');
  }
  
  export const updateVideoGame: (token: string, videogame: VideoGameProps) => Promise<VideoGameProps> = (token,videogame) => {
    
    console.log("TOKEN: "+token);
    var result = axios.put(`${videogameUrl}/${videogame._id}`, videogame, authConfig(token));
    result
        .then(async function (result){
        var videogame = result.data;
        await Storage.set({
            key: videogame._id!,
            value: JSON.stringify(videogame),
        });
    })
        .catch((error) => {
            console.log(error);
    });
    return withLogs(result, "updateVideoGame");
    //return withLogs(axios.put(`${videogameUrl}/${videogame._id}`, videogame, authConfig(token)), 'updateVideoGame');
  }

  export const eraseVideoGame: (token: string, videogame: VideoGameProps) => Promise<VideoGameProps[]> = (token, videogame) =>{

    var result = axios.delete(`${videogameUrl}/${videogame._id}`, authConfig(token));
    result.then(async function (r){
      await Storage.remove({key: videogame._id!});
    });
    return withLogs(result, "deleteVideoGame");

  }


  interface MessageData{
      type: string;
      payload: VideoGameProps;
  }

  const log = getLogger('ws');


  export const newWebSocket = (
    token: string,
    onMessage: (data: MessageData) => void
) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log("web socket onopen");
    ws.send(JSON.stringify({ type: "authorization", payload: { token } }));
  };
  ws.onclose = () => {
    log("web socket onclose");
  };
  ws.onerror = (error) => {
    log("web socket onerror", error);
  };
  ws.onmessage = (messageEvent) => {
    log("web socket onmessage");
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};