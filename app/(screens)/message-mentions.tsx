import { Screen, ScreenHeader } from '@/components/ui';
import { ActivityList } from '@/components/activity-list';

export default function MessageMentionsScreen() {
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Mentions" subtitle="Where you were @mentioned" />
      <ActivityList
        types={['mention']}
        emptyTitle="No mentions"
        emptyDescription="You'll see mentions here."
      />
    </Screen>
  );
}
