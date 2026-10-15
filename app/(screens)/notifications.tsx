import { Screen, ScreenHeader } from '@/components/ui';
import { ActivityList } from '@/components/activity-list';

export default function NotificationsScreen() {
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Notifications" subtitle="Recent activity" />
      <ActivityList
        types={[]}
        emptyTitle="You're all caught up"
        emptyDescription="Notifications about your activity will appear here."
      />
    </Screen>
  );
}
