import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import {
  avatarUrl,
  checkIn,
  displayName,
  getLeaderboard,
  listMyCheckIns,
} from '@/lib/api';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function UserCheckInsScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const history = useQuery({
    queryKey: ['check-ins', user?.id],
    enabled: !!user?.id,
    queryFn: () => listMyCheckIns(user!.id),
  });
  const leaderboard = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard('all'),
  });

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-ins', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Checked in!');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to check in'),
  });

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = history.data?.some((c) => c.checkin_date === today);

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Check-ins" subtitle="Build your streak" />

      {history.isLoading ? (
        <LoadingState />
      ) : history.isError ? (
        <ErrorState
          message={(history.error as any)?.message ?? 'Failed to load check-ins'}
          onRetry={() => history.refetch()}
        />
      ) : (
        <View className="px-6 pt-2">
          <Card className="gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-semibold">
                  {checkedInToday ? "You're checked in today" : 'Ready to check in?'}
                </Text>
                <Text variant="caption">
                  {history.data?.[0]
                    ? `Streak: ${history.data[0].streak} · Points: ${history.data[0].points}`
                    : 'No check-ins yet'}
                </Text>
              </View>
            </View>
            <Button
              label={checkedInToday ? 'Checked in today' : 'Check in'}
              onPress={() => checkInMutation.mutate()}
              loading={checkInMutation.isPending}
              disabled={checkedInToday}
            />
          </Card>

          {(history.data?.length ?? 0) > 0 ? (
            <>
              <Text variant="label" className="mb-2 mt-6">
                History
              </Text>
              <Card padded={false} className="px-4">
                {history.data!.slice(0, 10).map((c) => (
                  <View
                    key={c.checkin_date}
                    className="flex-row items-center justify-between py-3"
                  >
                    <Text>
                      {new Date(c.checkin_date).toLocaleDateString()}
                    </Text>
                    <Text variant="caption">
                      {c.points} pts · {c.streak} streak
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          <Text variant="label" className="mb-2 mt-6">
            Leaderboard
          </Text>
          {(leaderboard.data?.length ?? 0) === 0 ? (
            <Text variant="caption">No rankings yet.</Text>
          ) : (
            <Card padded={false} className="px-4">
              {leaderboard.data!.map((entry) => (
                <View
                  key={entry.user_id}
                  className="flex-row items-center gap-3 py-3"
                >
                  <Text className="w-6 text-center font-semibold text-muted-foreground">
                    {entry.rank}
                  </Text>
                  <Avatar
                    name={displayName(entry)}
                    uri={avatarUrl(entry.avatar_path)}
                    size={36}
                  />
                  <View className="flex-1">
                    <Text className="font-medium">{displayName(entry)}</Text>
                    <Text variant="caption">
                      {entry.points} pts · best streak {entry.max_streak}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>
      )}
    </Screen>
  );
}
