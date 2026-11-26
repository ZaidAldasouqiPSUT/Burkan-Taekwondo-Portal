import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { isAdmin, isStaff, useAuth } from '@/lib/auth';
import { useCollection, useScopedCollection, useStudents } from '@/lib/data';
import { attendanceRate, daysUntil, formatDate, money } from '@/lib/format';
import { colors, fonts, imageFor, images, lh } from '@/lib/theme';
import type { AttendanceRecord, BeltTest, Feedback, FinancialRecord, NewsItem, UserProfile } from '@/lib/types';
import { Avatar, Body, Button, Card, Muted, Overline, Row, Screen, StatCard, Title } from '@/components/ui';
import { isRTL, ls, t } from '@/lib/i18n';

export default function Home() {
  const { profile } = useAuth();
  const staff = isStaff(profile);
  const admin = isAdmin(profile);
  const role = profile!.role;

  const students = useStudents();
  const attendance = useScopedCollection<AttendanceRecord>('attendance');
  const feedback = useScopedCollection<Feedback>('feedback', role !== 'coach');
  const finances = useScopedCollection<FinancialRecord>('finances', role !== 'coach');
  const tests = useCollection<BeltTest>('beltTests');
  const news = useCollection<NewsItem>('news');
  const pendingUsers = useCollection<UserProfile>('users', admin);

  const summary = useMemo(() => {
    const upcoming = tests.data.filter((t) => daysUntil(t.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    return {
      activeStudents: students.data.filter((s) => s.status !== 'Inactive').length,
      rate: attendanceRate(attendance.data),
      nextTest: upcoming[0],
      balance: finances.data.filter((f) => f.status === 'Due').reduce((sum, f) => sum + Number(f.amount || 0), 0),
      unread: feedback.data.filter((f) => !f.read).length,
      latestNews: [...news.data].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0],
      pending: pendingUsers.data.filter((u) => u.status === 'pending').length,
    };
  }, [students.data, attendance.data, tests.data, finances.data, feedback.data, news.data, pendingUsers.data]);

  const firstName = profile!.fullName.split(' ')[0];
  const styles = makeStyles();

  return (
    <Screen padded={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image source={images.hero} style={[StyleSheet.absoluteFill, { opacity: 0.42 }]} contentFit="cover" contentPosition="top" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        <View style={styles.pill}>
          <View style={styles.dot} />
          <Text style={styles.pillText}>{t('{role} portal', { role: t(role) }).toUpperCase()}</Text>
        </View>
        <Text style={styles.heroTitle}>
          {t('WELCOME BACK,')}{'\n'}
          <Text style={{ color: colors.primary }}>{firstName.toUpperCase()}</Text>
        </Text>
        <Text style={styles.heroBody}>{t('Stay disciplined. Track your progress. Never back down. This is Burkan Taekwondo.')}</Text>
        <Row gap={10} style={{ marginTop: 20 }}>
          <Button title="Schedule" icon="calendar" onPress={() => router.push('/schedule')} style={{ flex: 1 }} />
          <Button title="Attendance" variant="light" onPress={() => router.push('/attendance')} style={{ flex: 1 }} />
        </Row>
      </View>

      <View style={{ padding: 16, gap: 16, marginTop: -28 }}>
        {admin && summary.pending > 0 ? (
          <Card accent={colors.warning} onPress={() => router.push('/accounts')}>
            <Row>
              <View style={{ flex: 1 }}>
                <Overline style={{ color: colors.warning }}>Action needed</Overline>
                <Title style={{ marginTop: 4 }}>{t('{n} account(s) awaiting approval', { n: summary.pending })}</Title>
              </View>
              <Text style={{ fontFamily: fonts.bold, color: colors.primary }}>{t('REVIEW →')}</Text>
            </Row>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {staff ? <StatCard icon="users" label="Active students" value={summary.activeStudents} onPress={() => router.push('/students')} /> : null}
          <StatCard icon="trending-up" label="Attendance rate" value={summary.rate === null ? '—' : `${summary.rate}%`} onPress={() => router.push('/attendance')} />
          <StatCard icon="award" label="Next belt test" value={summary.nextTest ? formatDate(summary.nextTest.date) : '—'} onPress={() => router.push('/belt-tests')} />
          {role !== 'coach' ? (
            <StatCard icon="alert-circle" label="Balance due" value={money(summary.balance)} tone="primary" onPress={() => router.push('/finances')} />
          ) : null}
          {role !== 'coach' && summary.unread > 0 ? (
            <StatCard icon="message-square" label="Unread feedback" value={summary.unread} tone="warning" onPress={() => router.push('/feedback')} />
          ) : null}
        </View>

        {!staff && students.data.length ? (
          <View style={{ gap: 10 }}>
            <Overline>{role === 'parent' ? t('My children') : t('My profile')}</Overline>
            {students.data.map((s) => (
              <Card key={s.id} onPress={role === 'parent' ? () => router.push('/students') : undefined}>
                <Row gap={12}>
                  <Avatar name={s.fullName} color={s.beltColor === '#E5E7EB' ? '#9CA3AF' : s.beltColor} />
                  <View style={{ flex: 1 }}>
                    <Title>{s.fullName}</Title>
                    <Muted>
                      {t(s.belt)} · {t(s.membership)}
                    </Muted>
                  </View>
                </Row>
              </Card>
            ))}
          </View>
        ) : null}

        {summary.latestNews ? (
          <Banner
            image={imageFor(summary.latestNews.image)}
            overline="Club news"
            title={summary.latestNews.title}
            body={summary.latestNews.excerpt}
            cta="Read more"
            onPress={() => router.push('/news')}
          />
        ) : null}
        <Banner
          image={images.logo}
          contain
          overline="Registration"
          title={summary.nextTest ? summary.nextTest.label : 'Upcoming belt test'}
          body={
            summary.nextTest
              ? t('{n} days left · {place}', { n: daysUntil(summary.nextTest.date), place: t(summary.nextTest.location) })
              : 'The countdown begins. Verify your attendance requirements and register for the next promotion test.'
          }
          cta={staff ? 'View candidates' : 'Register now'}
          onPress={() => router.push('/belt-tests')}
        />
      </View>
    </Screen>
  );
}

function Banner({
  image,
  overline,
  title,
  body,
  cta,
  onPress,
  contain,
}: {
  image: number;
  overline: string;
  title: string;
  body: string;
  cta: string;
  onPress: () => void;
  contain?: boolean;
}) {
  return (
    <Card onPress={onPress} style={{ padding: 0, overflow: 'hidden', flexDirection: 'row' }}>
      <View style={{ width: '34%', backgroundColor: contain ? '#fff' : '#000' }}>
        <Image source={image} style={{ flex: 1, minHeight: 130 }} contentFit={contain ? 'contain' : 'cover'} />
      </View>
      <View style={{ flex: 1, padding: 14, gap: 4 }}>
        <Overline>{t(overline)}</Overline>
        <Title numberOfLines={2}>{t(title)}</Title>
        <Body numberOfLines={2} style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
          {body}
        </Body>
        <Text style={{ fontFamily: fonts.bold, color: colors.primary, fontSize: 12, marginTop: 4 }}>{isRTL() ? `← ${t(cta)}` : `${t(cta).toUpperCase()} →`}</Text>
      </View>
    </Card>
  );
}

// Built at render time so fonts follow the active language.
const makeStyles = () =>
  StyleSheet.create({
  hero: { backgroundColor: '#000', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 52, overflow: 'hidden' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(225,20,50,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(225,20,50,0.4)',
    marginBottom: 16,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  pillText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 11, letterSpacing: ls(1.5) },
  heroTitle: { color: '#fff', fontFamily: fonts.display, fontSize: 38, lineHeight: lh(40), textAlign: isRTL() ? 'right' : 'left', letterSpacing: ls(-0.5) },
  heroBody: { color: '#D1D5DB', fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: isRTL() ? 'right' : 'left' },
});
