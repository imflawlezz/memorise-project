import React, { useMemo } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonLabel } from '@ionic/react';
import { ReviewLog } from '../../models/ReviewLog';
import { ProgressChart } from './ProgressChart';
import { Heatmap } from './Heatmap';
import { isToday, format, startOfDay } from 'date-fns';
import './StatsDashboard.css';

interface StatsDashboardProps {
  reviewLogs: ReviewLog[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ reviewLogs }) => {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    const todayReviews = reviewLogs.filter(log => 
      isToday(new Date(log.reviewDate))
    );
    
    const totalTime = reviewLogs.reduce((sum, log) => sum + log.timeSpent, 0);
    const todayTime = todayReviews.reduce((sum, log) => sum + log.timeSpent, 0);
    
    // Calculate streak
    let streak = 0;
    let checkDate = today;
    const sortedLogs = [...reviewLogs].sort((a, b) => 
      new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()
    );
    
    const uniqueDates = new Set(
      sortedLogs.map(log => format(startOfDay(new Date(log.reviewDate)), 'yyyy-MM-dd'))
    );
    
    while (uniqueDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }

    return {
      todayReviews: todayReviews.length,
      todayTime,
      totalReviews: reviewLogs.length,
      totalTime,
      streak,
      averageTime: reviewLogs.length > 0 ? Math.round(totalTime / reviewLogs.length) : 0,
    };
  }, [reviewLogs]);

  return (
    <div className="stats-dashboard">
      <IonGrid>
        <IonRow>
          <IonCol size="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Today</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="stat-value">{stats.todayReviews}</div>
                <IonLabel color="medium">Cards reviewed</IonLabel>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Streak</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="stat-value">{stats.streak}</div>
                <IonLabel color="medium">Days</IonLabel>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol size="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Total</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="stat-value">{stats.totalReviews}</div>
                <IonLabel color="medium">Reviews</IonLabel>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Avg Time</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="stat-value">{Math.round(stats.averageTime / 60)}m</div>
                <IonLabel color="medium">Per card</IonLabel>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Progress (30 days)</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <ProgressChart reviewLogs={reviewLogs} days={30} />
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Activity Heatmap</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <Heatmap reviewLogs={reviewLogs} />
        </IonCardContent>
      </IonCard>
    </div>
  );
};

