import React from 'react';
import {IonItem, IonLabel,  IonImg} from '@ionic/react';
import {VideoGameProps} from './VideoGamesProps'

interface VideoGamesExt extends VideoGameProps {
    onEdit: (_id?: string) => void;
  }
  
  const VideoGame: React.FC<VideoGamesExt> = ({ _id, description, year, type, rating, photoPath, onEdit }) => {
    return (
      <IonItem onClick={() => onEdit(_id)}>
        <IonLabel>Name: {description}  rating: {rating}</IonLabel>
        <IonLabel><IonImg style={{width: "100px"}} alt={"No Photo"} src={photoPath}/></IonLabel>
      </IonItem>
    );
  };



export default VideoGame;