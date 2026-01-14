import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { DeckProvider } from './contexts/DeckContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationTabs } from './components/NavigationTabs';
import Home from './pages/Home';
import Decks from './pages/Decks';
import DeckDetail from './pages/DeckDetail';
import Review from './pages/Review';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';

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

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
    <IonApp>
      <ThemeProvider>
        <DeckProvider>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/home" component={Home} />
                <Route exact path="/decks" component={Decks} />
                <Route exact path="/deck/:id" component={DeckDetail} />
                <Route exact path="/statistics" component={Statistics} />
                <Route exact path="/settings" component={Settings} />
                <Route exact path="/review/:id" component={Review} />
                <Route exact path="/" render={() => <Redirect to="/home" />} />
              </IonRouterOutlet>
              <NavigationTabs />
            </IonTabs>
          </IonReactRouter>
        </DeckProvider>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
