import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { createReport, listMyReports } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

const statusTone: Record<string, 'default' | 'primary' | 'muted' | 'destructive'> = {
  open: 'primary',
  reviewing: 'default',
  resolved: 'muted',
  dismissed: 'muted',
};

export default function ReportsScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const query = useQuery({
    queryKey: ['my-reports', user?.id],
    enabled: !!user?.id,
    queryFn: () => listMyReports(user!.id),
  });

  const submit = useMutation({
    mutationFn: () => createReport({ reporterId: user!.id, reason: reason.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reports', user?.id] });
      setReason('');
      toast.success('Report submitted');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to submit report'),
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Reports" subtitle="Reports you have submitted" />

      <View className="px-6 pt-2">
        <Card className="gap-3">
          <Input
            label="File a report"
            placeholder="Describe the issue"
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <Button
            label="Submit report"
            size="sm"
            onPress={() => submit.mutate()}
            loading={submit.isPending}
            disabled={!reason.trim()}
          />
        </Card>

        <Text variant="label" className="mb-2 mt-6">
          Your reports
        </Text>
      </View>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load reports'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState icon="flag" title="No reports" description="You haven't reported anything." />
      ) : (
        <View className="px-6">
          {query.data!.map((report) => (
            <Card key={report.id} className="mb-3 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 font-medium" numberOfLines={2}>
                  {report.reason}
                </Text>
                <Badge label={report.status} tone={statusTone[report.status] ?? 'muted'} />
              </View>
              <Text variant="caption">{formatRelativeTime(report.created_at)}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
