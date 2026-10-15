import { Screen, ScreenHeader } from '@/components/ui';
import { ActivityList } from '@/components/activity-list';

export default function MessageRepliesScreen() {
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Replies" subtitle="Replies to your comments" />
      <ActivityList
        types={['content_comment', 'comment_reply']}
        emptyTitle="No replies yet"
      />
    </Screen>
  );
}
