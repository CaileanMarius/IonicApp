import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel
} from '@ionic/react';
import {getLogger} from '../core';
import {VideoGameContext} from './VideoGameProvider';
import {RouteComponentProps} from 'react-router';
import {VideoGameProps} from './VideoGamesProps';

const log = getLogger('VideoGameEdit');

interface VideoGameEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const VideoGameEdit: React.FC<VideoGameEditProps> = ({history, match}) =>{
    const {videogames, saving, savingError, saveVideoGame} = useContext(VideoGameContext);
    const [description, setDescription] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const [rating, setRating] = useState('');
    const [videogame, setVideoGame] = useState<VideoGameProps>();
    useEffect(()=>{
        log('useEffect');
        const routeId = match.params.id || '';
        const videogame = videogames?.find(it => it.id === routeId);
        setVideoGame(videogame);
        if(videogame)
        {
            setDescription(videogame.description);
            setYear(videogame.year);
            setType(videogame.type);
            setRating(videogame.rating);
            //setText(videogame.year);
        }
    }, [match.params.id, videogames]);

    const handleSave = () =>{
        const editedVideoGame = videogame ? { ...videogame, description, year, type, rating } : {description, year, type, rating};
        saveVideoGame && saveVideoGame(editedVideoGame).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit VideoGame</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleSave}>
                  Save VideoGame
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonGrid>
              <IonLabel>Description: </IonLabel>
            <IonRow>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value || '')} />
            
            <IonLoading isOpen={saving} />
            {savingError && (
              <div>{savingError.message || 'Failed to save videogame'}</div>
            )}
            </IonRow>
            <IonLabel>Year:</IonLabel>
            <IonRow>
            <IonInput value={year} onIonChange={e => setYear(e.detail.value || '')} />
            
            <IonLoading isOpen={saving} />
            {savingError && (
              <div>{savingError.message || 'Failed to save videogame'}</div>
            )}
            </IonRow>

              <IonLabel>Type:</IonLabel>
              <IonRow>
              <IonInput value={type} onIonChange={e => setType(e.detail.value || '')} />
            
            <IonLoading isOpen={saving} />
            {savingError && (
              <div>{savingError.message || 'Failed to save videogame'}</div>
            )}
               
              </IonRow>

              <IonLabel>Rating:</IonLabel>
              <IonRow>
              <IonInput value={rating} onIonChange={e => setRating(e.detail.value || '')} />
            
            <IonLoading isOpen={saving} />
            {savingError && (
              <div>{savingError.message || 'Failed to save videogame'}</div>
            )}

              </IonRow>

            </IonGrid>
          </IonContent>
        </IonPage>
      );

};

export default VideoGameEdit;