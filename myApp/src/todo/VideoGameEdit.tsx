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
    IonLabel, 
    IonImg,
    IonFab,
    IonFabButton,
    IonActionSheet,
    IonIcon
} from '@ionic/react';
import {getLogger} from '../core';
import {VideoGameContext} from './VideoGameProvider';
import {RouteComponentProps} from 'react-router';
import {VideoGameProps} from './VideoGamesProps';
import {useNetwork} from '../utils/useNetwork';

import {Photo, usePhotoGallery} from "../utils/usePhotoGallery";
import {camera, trash, close} from "ionicons/icons";
import {MyMap} from "../utils/MyMap";

const log = getLogger('VideoGameEdit');

interface VideoGameEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const VideoGameEdit: React.FC<VideoGameEditProps> = ({history, match}) =>{
    const {videogames, saving, savingError, saveVideoGame, deleteVideoGame, getServerVideoGame, oldVideoGame} = useContext(VideoGameContext);
    const [description, setDescription] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const [rating, setRating] = useState('');

    const [videogame, setVideoGame] = useState<VideoGameProps>();
    const [videogame2, setVideoGame2] = useState<VideoGameProps>();

    const [photoPath, setPhotoPath] = useState('');
    const [latitude, setLatitude] = useState(47.912537);
    const [longitude, setLongitude] = useState(25.676545);

    const{networkStatus} = useNetwork();

    const {photos, takePhoto, deletePhoto } = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();

    useEffect(()=>{
        log('useEffect');
        const routeId = match.params.id || '';
        const videogame = videogames?.find(it => it._id === routeId);
        setVideoGame(videogame);
        if(videogame)
        {
            setDescription(videogame.description);
            setYear(videogame.year);
            setType(videogame.type);
            setRating(videogame.rating);
            setPhotoPath(videogame.photoPath);
            if(videogame.latitude) setLatitude(videogame.latitude);
            if(videogame.longitude) setLongitude(videogame.longitude);
            //setText(videogame.year);
            //getServerVideoGame && getServerVideoGame(match.params.id!, videogame?.version);

        }
    }, [match.params.id, videogames, getServerVideoGame]);


    useEffect(() =>{
      setVideoGame2(oldVideoGame);
      log("OLD VIDEOGAME: " + JSON.stringify(oldVideoGame));
    }, [oldVideoGame]);



    const handleSave = () =>{
        const editedVideoGame = videogame ? { 
           ...videogame,
            description,
            year, 
            type,
            rating,
            photoPath,
            latitude,
            longitude,
            status: 0,
            } : {description, year, type, rating,photoPath, latitude, longitude, status: 0};
        saveVideoGame && saveVideoGame(editedVideoGame, networkStatus.connected).then(() => {
        log(JSON.stringify(videogame2));
        if(videogame2 == undefined) history.goBack();
        });
    };

//delete
//...pauza    
const handleDelete = () => {
  const editedVideoGame = videogame ? {...videogame,
        description,
        year, 
        type,
        rating,
        photoPath, 
        latitude,
        longitude,
        status: 0,
      }
      : { description, year, type, rating, photoPath, latitude, longitude, status: 0};
  deleteVideoGame &&
      deleteVideoGame(editedVideoGame, networkStatus.connected).then(() =>
          history.goBack()
      );
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
                <IonButton onClick={handleDelete}>
                  Delete VideoGame
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
            
            {
              videogame2 && (
               <>
                    <div className={"modifiedVersionTitle"}>The latest modified version of videogame</div>
                    <IonGrid>

                    <IonLabel>Description: </IonLabel>
                      <IonRow>
                      <IonInput value={videogame2.description} onIonChange={e => setDescription(e.detail.value || '')} />
                      
                      <IonLoading isOpen={saving} />
                      {savingError && (
                        <div>{savingError.message || 'Failed to save videogame'}</div>
                      )}
                      </IonRow>
                      <IonLabel>Year:</IonLabel>
                      <IonRow>
                      <IonInput value={videogame2.year} onIonChange={e => setYear(e.detail.value || '')} />
                      
                      <IonLoading isOpen={saving} />
                      {savingError && (
                        <div>{savingError.message || 'Failed to save videogame'}</div>
                      )}
                      </IonRow>

                        <IonLabel>Type:</IonLabel>
                        <IonRow>
                        <IonInput value={videogame2.type} onIonChange={e => setType(e.detail.value || '')} />
                      
                      <IonLoading isOpen={saving} />
                      {savingError && (
                        <div>{savingError.message || 'Failed to save videogame'}</div>
                      )}
                        
                        </IonRow>

                        <IonLabel>Rating:</IonLabel>
                        <IonRow>
                        <IonInput value={videogame2.rating} onIonChange={e => setRating(e.detail.value || '')} />
                      
                      <IonLoading isOpen={saving} />
                      {savingError && (
                        <div>{savingError.message || 'Failed to save videogame'}</div>
                      )}

                        </IonRow>
                    </IonGrid>

               </>
            )}

        <IonLoading isOpen={saving} />
        {savingError && (
            <div>{savingError.message || 'Failed to save videogame'}</div>
        )}
        <IonImg
            style={{width: "600px", height: "600px", margin: "0 auto"}}
            alt={"No photo"}
            onClick = {() => {setPhotoToDelete(photos?.find(vd => vd.webviewPath=== photoPath))}}
            src={photoPath}
        />
        <MyMap
            lat={latitude}
            lng={longitude}
            onMapClick={(location: any) => {
              setLatitude(location.latLng.lat());
              setLongitude(location.latLng.lng());
            }}
        />
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
              onClick={() => {
                const photoTaken = takePhoto();
                photoTaken.then((data) => {
                  setPhotoPath(data.webviewPath!);
                });
              }}
          >
            <IonIcon icon={camera}/>
          </IonFabButton>
        </IonFab>
        <IonActionSheet
            isOpen={!!photoToDelete}
            buttons={[
              {
                text: "Delete",
                role: "destructive",
                icon: trash,
                handler: () => {
                  if (photoToDelete) {
                    deletePhoto(photoToDelete);
                    setPhotoToDelete(undefined);
                    setPhotoPath("")
                  }
                },
              },
              {
                text: "Cancel",
                icon: close,
                role: "cancel",
              },
            ]}
            onDidDismiss={() => setPhotoToDelete(undefined)}
        />
            



          </IonContent>
        </IonPage>
      );

};

export default VideoGameEdit;