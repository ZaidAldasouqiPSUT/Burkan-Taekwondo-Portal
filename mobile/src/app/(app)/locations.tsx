import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { isAdmin, useAuth } from '@/lib/auth';
import { create, remove, useCollection } from '@/lib/data';
import { colors } from '@/lib/theme';
import type { Location } from '@/lib/types';
import { Body, Button, Card, Empty, IconButton, Loading, Muted, PageHeader, Row, Screen, Title, confirm } from '@/components/ui';
import { FormSheet } from '@/components/form-sheet';

export default function Locations() {
  const { profile } = useAuth();
  const admin = isAdmin(profile);
  const { data, loading } = useCollection<Location>('locations');
  const [adding, setAdding] = useState(false);

  return (
    <Screen>
      <PageHeader
        title="Our Locations"
        subtitle="Visit us at Tabarbour or North Marka branches."
        action={admin ? <Button title="Add" icon="plus" size="sm" onPress={() => setAdding(true)} /> : null}
      />
      {loading ? (
        <Loading />
      ) : data.length === 0 ? (
        <Empty icon="map-pin" title="No locations yet" />
      ) : (
        [...data]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((l) => (
            <Card key={l.id} style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ height: 110, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="map" size={36} color={colors.primary} />
              </View>
              <View style={{ padding: 16, gap: 8 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Title style={{ flex: 1 }}>{l.name}</Title>
                  {admin ? <IconButton icon="trash-2" label="Delete location" color={colors.muted} onPress={() => confirm('Delete location?', l.name, () => remove('locations', l.id))} /> : null}
                </Row>
                <Row gap={8}>
                  <Feather name="map-pin" size={15} color={colors.primary} />
                  <Body style={{ flex: 1 }}>{l.address}</Body>
                </Row>
                <Row gap={8}>
                  <Feather name="clock" size={15} color={colors.primary} />
                  <Muted style={{ flex: 1 }}>{l.hours}</Muted>
                </Row>
                <Row gap={8}>
                  <Feather name="phone" size={15} color={colors.primary} />
                  <Muted>{l.phone}</Muted>
                </Row>
                <Row gap={10} style={{ marginTop: 6 }}>
                  <Button title="Directions" icon="navigation" onPress={() => Linking.openURL(l.mapsUrl)} style={{ flex: 1 }} />
                  <Button title="Call" icon="phone" variant="outline" onPress={() => Linking.openURL(`tel:${l.phone.replace(/\s/g, '')}`)} style={{ flex: 1 }} />
                </Row>
              </View>
            </Card>
          ))
      )}

      <FormSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title="Add location"
        fields={[
          { key: 'name', label: 'Name', placeholder: 'Tabarbour Branch' },
          { key: 'address', label: 'Address' },
          { key: 'phone', label: 'Phone', type: 'phone', placeholder: '0795693034' },
          { key: 'hours', label: 'Hours', placeholder: 'Saturday–Thursday · 4:00 PM–10:00 PM' },
          { key: 'mapsUrl', label: 'Google Maps link', required: false, hint: 'Leave empty to search the address.' },
        ]}
        onSubmit={async (v) => {
          await create('locations', {
            ...v,
            mapsUrl: v.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}`,
          });
        }}
      />
    </Screen>
  );
}
