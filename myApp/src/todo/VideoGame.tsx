import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {VideoGameProps} from './VideoGamesProps'

interface VideoGamesExt extends VideoGameProps {
    onEdit: (id?: string) => void;
  }
  
  const VideoGame: React.FC<VideoGamesExt> = ({ id, description, year, type, rating, onEdit }) => {
    return (
      <IonItem onClick={() => onEdit(id)}>
        <IonLabel>{description}</IonLabel>
      </IonItem>
    );
  };



export default VideoGame;