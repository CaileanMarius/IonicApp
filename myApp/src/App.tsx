import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { VideoGameEdit, VideoGamesList } from './todo';
import {VideoGameProvider} from './todo/VideoGameProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';


const App: React.FC = () => (
  <IonApp>
    <VideoGameProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/videogames" component={VideoGamesList} exact={true} />
          <Route path="/videogame" component={VideoGameEdit} exact={true} />
          <Route path="/videogame/:id" component={VideoGameEdit} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/videogames" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </VideoGameProvider>
  </IonApp>
);


export default App;
