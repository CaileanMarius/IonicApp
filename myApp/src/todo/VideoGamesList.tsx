import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import  VideoGame from './VideoGame';
import { getLogger } from '../core';
import {VideoGameContext} from './VideoGameProvider';

const log = getLogger('VideoGamesList');

const VideoGamesList: React.FC<RouteComponentProps> = ({ history }) => {
    const { videogames, fetching, fetchingError } = useContext(VideoGameContext);
    log('render');
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Video Games</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
              <IonLoading isOpen={fetching} message="Fetching Videogames" />
              {videogames && (
                  <IonList>
                      {
                          videogames.map(({id, description, year, type, rating}) =>
                              <VideoGame key={id} id={id} description={description} year={year} type={type} rating={rating}  onEdit={id => history.push(`/videogame/${id}`)}/>)
                      }
                  </IonList>
              )}
              {fetchingError && (
                  <div>{fetchingError.message || 'Failed to fetch items'}</div>
              )}
              <IonFab vertical="bottom" horizontal="end" slot="fixed">
                  <IonFabButton onClick={() => history.push('/videogame')}>
                      <IonIcon icon={add} />
                  </IonFabButton>
              </IonFab>
          </IonContent>
      </IonPage>
    );
  };
  
  export default VideoGamesList;
  