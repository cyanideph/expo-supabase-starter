import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  listCategoryContent,
  listContentCategories,
  type ContentCategory,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  ListRow,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

export default function ContentCategoriesScreen() {
  const [selected, setSelected] = useState<ContentCategory | null>(null);

  const categories = useQuery({
    queryKey: ['content-categories'],
    queryFn: () => listContentCategories(),
  });

  const content = useQuery({
    queryKey: ['category-content', selected?.id],
    enabled: !!selected?.id,
    queryFn: () => listCategoryContent(selected!.id),
  });

  if (selected) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title={selected.name} subtitle={selected.description ?? undefined} />

        {content.isLoading ? (
          <LoadingState />
        ) : content.isError ? (
          <ErrorState
            message={(content.error as any)?.message ?? 'Failed to load content'}
            onRetry={() => content.refetch()}
          />
        ) : (content.data?.length ?? 0) === 0 ? (
          <EmptyState icon="grid" title="Nothing here yet" description="No content in this category." />
        ) : (
          <View className="px-6 pt-2">
            {content.data!.map((item) => (
              <Card key={item.id} className="mb-3 gap-1">
                {item.title ? <Text className="font-semibold">{item.title}</Text> : null}
                {item.body ? (
                  <Text variant="caption" numberOfLines={3}>
                    {item.body}
                  </Text>
                ) : null}
                <Text variant="caption">{formatRelativeTime(item.created_at)}</Text>
              </Card>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelected(null)}
              className="mt-2 flex-row items-center justify-center gap-1 active:opacity-70"
            >
              <Icon name="chevron-left" size={16} color="#6b7280" />
              <Text variant="caption">All categories</Text>
            </Pressable>
          </View>
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Categories" subtitle="Browse content by topic" />

      {categories.isLoading ? (
        <LoadingState />
      ) : categories.isError ? (
        <ErrorState
          message={(categories.error as any)?.message ?? 'Failed to load categories'}
          onRetry={() => categories.refetch()}
        />
      ) : (categories.data?.length ?? 0) === 0 ? (
        <EmptyState icon="grid" title="No categories yet" />
      ) : (
        <View className="px-6 pt-2">
          <Card padded={false} className="px-4">
            {categories.data!.map((cat) => (
              <ListRow
                key={cat.id}
                title={cat.name}
                subtitle={cat.description ?? undefined}
                showChevron
                right={cat.kind ? <Badge label={cat.kind} tone="muted" /> : undefined}
                onPress={() => setSelected(cat)}
              />
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}
