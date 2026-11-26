import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { isAdmin, useAuth } from '@/lib/auth';
import { create, remove, useCollection } from '@/lib/data';
import { formatDate, todayISO } from '@/lib/format';
import { imageFor, images } from '@/lib/theme';
import type { NewsItem } from '@/lib/types';
import { Badge, Body, Button, Card, Empty, Loading, Muted, PageHeader, Row, Screen, Sheet, Title, confirm } from '@/components/ui';
import { FormSheet } from '@/components/form-sheet';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const IMAGE_OPTIONS = (Object.keys(images) as (keyof typeof images)[]).map((k) => ({ value: k, label: k }));

export default function News() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile);
  const { data, loading } = useCollection<NewsItem>('news');
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [adding, setAdding] = useState(false);
  const items = useMemo(() => [...data].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), [data]);

  return (
    <Screen>
      <PageHeader
        title="Club News"
        subtitle="Announcements, achievements, and Burkan pride."
        action={admin ? <Button title="Post" icon="plus" size="sm" onPress={() => setAdding(true)} /> : null}
      />
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="file-text" title="No news yet" message="Club announcements will appear here." />
      ) : (
        items.map((n) => (
          <Card key={n.id} onPress={() => setSelected(n)} style={{ padding: 0, overflow: 'hidden' }}>
            <Image source={imageFor(n.image)} style={{ height: 180, backgroundColor: '#000' }} contentFit="cover" contentPosition="top" />
            <View style={{ padding: 16, gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Badge label={n.category} tone="primary" />
                <Muted style={{ fontSize: 12 }}>{formatDate(n.publishedAt)}</Muted>
              </Row>
              <Title>{n.title}</Title>
              <Muted numberOfLines={3}>{n.excerpt}</Muted>
            </View>
          </Card>
        ))
      )}

      <Sheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `${t(selected.author)} · ${formatDate(selected.publishedAt)}` : undefined}
        footer={
          <>
            {admin && selected ? (
              <Button
                title="Delete"
                variant="danger"
                style={{ flex: 1 }}
                onPress={() =>
                  confirm('Delete story?', selected.title, () => {
                    remove('news', selected.id);
                    setSelected(null);
                  })
                }
              />
            ) : null}
            <Button title="Close" onPress={() => setSelected(null)} style={{ flex: 1 }} />
          </>
        }
      >
        {selected ? (
          <>
            <Image source={imageFor(selected.image)} style={{ height: 220, borderRadius: 12, backgroundColor: '#000' }} contentFit="cover" contentPosition="top" />
            <Badge label={selected.category} tone="primary" />
            <Body style={{ fontSize: 16, lineHeight: 25 }}>{selected.body || selected.excerpt}</Body>
          </>
        ) : null}
      </Sheet>

      <FormSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title="Post news"
        submitLabel="Publish"
        initial={{ author: profile?.fullName ?? 'Burkan Taekwondo Center', category: 'Announcement' }}
        fields={[
          { key: 'title', label: 'Headline' },
          { key: 'category', label: 'Category', type: 'select', options: ['Announcement', 'National Team', 'Belt Testing', 'Tournament', 'Club Life'].map((v) => ({ value: v, label: v })) },
          { key: 'excerpt', label: 'Summary', type: 'multiline' },
          { key: 'body', label: 'Full story', type: 'multiline', required: false },
          { key: 'image', label: 'Photo', type: 'select', options: IMAGE_OPTIONS },
          { key: 'author', label: 'Author' },
        ]}
        onSubmit={async (v) => {
          await create('news', { ...v, publishedAt: todayISO() });
          toast('Published', v.title);
        }}
      />
    </Screen>
  );
}
