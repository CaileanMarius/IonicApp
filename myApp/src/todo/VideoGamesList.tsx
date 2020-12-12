import React, { useContext, useEffect, useState } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar, IonButton, IonSearchbar, IonItem, IonLabel, IonSelectOption, IonSelect,IonInfiniteScroll
,IonInfiniteScrollContent
} from '@ionic/react';
import { add, search } from 'ionicons/icons';
import  VideoGame from './VideoGame';
import { getLogger } from '../core';
import {VideoGameContext} from './VideoGameProvider';
import {AuthContext} from "../auth";
import { VideoGameProps } from './VideoGamesProps';
import {useNetwork} from "../utils/useNetwork";


const log = getLogger('VideoGamesList');

const VideoGamesList: React.FC<RouteComponentProps> = ({ history }) => {
    const { videogames, fetching, fetchingError, updateServer } = useContext(VideoGameContext);

    const[disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const[pos, setPos] = useState(8);

    const {networkStatus}  = useNetwork();

    const[filter, setFilter] = useState<string | undefined>("any rating");
    const selectOptions = ["<= 5 rating", "> 5 rating", "any rating"];
    const [searchText, setSearchText] = useState<string>("");

    const [videogamesShow, setVideogamesShow] = useState<VideoGameProps[]>([]);

    const {logout} = useContext(AuthContext);
    const handleLogout = () =>{
      logout?.();
      return <Redirect to={{pathname: "/login"}} />;
    }

    async function searchNext($event: CustomEvent<void>)
    {
      if(videogames && pos < videogames.length){
        setVideogamesShow([...videogames.slice(0, 8+pos)]);
        setPos(pos+8);
      }
      else{
        setDisableInfiniteScroll(true);
      }
      log("videogames from" + 0 + "to " + pos)
      log(videogamesShow)
      await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render');

    //update server when network status is back online
    useEffect(() => {
      if (networkStatus.connected === true) {
          updateServer && updateServer();
      }
  }, [networkStatus.connected]);


  //paginare domnule
    useEffect(() =>{
      if(videogames?.length){
        setVideogamesShow(videogames.slice(0, pos));
      }
    }, [videogames]);

    //filter
    useEffect(()=>{
      if(filter && videogames){
        if(filter === "<= 5 rating"){
          setVideogamesShow(videogames.filter((videogame) => parseInt(videogame.rating) <= 5 ));
        }
        else if(filter === "> 5 rating"){
          setVideogamesShow(videogames.filter((videogame) => parseInt(videogame.rating) > 5 ));

        }
        else if(filter === "any rating"){
          setVideogamesShow(videogames);
      }
      }
    }, [filter]);

    //search
    useEffect(()=>{
      if(searchText === "" && videogames){
        setVideogamesShow(videogames);

      }
      if(searchText && videogames){
        setVideogamesShow(videogames.filter((videogame) => videogame.description.startsWith(searchText)));
      }
    },[searchText]);


    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
          <IonButton slot="end" onClick={handleLogout}>Logout</IonButton>
           <IonTitle>Video Games</IonTitle>
          </IonToolbar>
          <div className={"networkDiv"}>
                    Network is: <b>{networkStatus.connected ? "online" : "offline"}</b>
          </div>
          <IonSearchbar className="searchBar" color="dark" value={searchText} debounce={500} onIonChange={(e) => setSearchText(e.detail.value!)}/>
          <IonItem className="ionItem" color="dark">
                    <IonLabel>Filter products by rating</IonLabel>
                    <IonSelect value={filter} onIonChange={(e) => setFilter(e.detail.value)}>
                        {selectOptions.map((option) => (
                            <IonSelectOption key={option} value={option}>
                                {option}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
        </IonHeader>
        <IonContent>
              <IonLoading isOpen={fetching} message="Fetching Videogames" />
              {videogames &&
               videogamesShow.map((videogame: VideoGameProps) => {
                 return(
                  <IonList >
                    <VideoGame key={videogame._id} _id={videogame._id} description={videogame.description} year={videogame.year} type={videogame.type} rating={videogame.rating} status={videogame.status}  photoPath={videogame.photoPath} latitude={videogame.latitude} longitude={videogame.longitude}  onEdit={id => history.push(`/videogame/${id}`)}/> 
                  </IonList>
                 );
               })}

                <IonInfiniteScroll threshold="75px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading for more videogames..."/>
                </IonInfiniteScroll>

               
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
  