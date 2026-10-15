import { Screen, ScreenHeader } from '@/components/ui';
import { ActivityList } from '@/components/activity-list';

export default function MessageReactionsScreen() {
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Reactions" subtitle="Reactions to your messages & posts" />
      <ActivityList
        types={['content_reaction', 'room_message_reaction']}
        emptyTitle="No reactions yet"
      />
    </Screen>
  );
}
