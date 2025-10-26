// components/StudentNav.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons  } from '@expo/vector-icons';

export default function StudentNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'home', icon: 'home-outline' as const, route: '/(student)/home' as const },
    { name: 'discover', icon: 'compass-outline' as const, route: '/(student)/discover' as const },
    { name: 'profile', icon: 'account' as const, route: '/(student)/my-student-profile' as const },
  ];

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = isActive(item.route);
        return (
          <Pressable
            key={item.name}
            style={[styles.navItem, active && styles.navItemActive]}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name={item.icon}
                size={26}
                color={active ? '#EFA508' : '#F0F7FF'}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3A52A6',
    paddingVertical: 3,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navItemActive: {
    backgroundColor: '#EFA508',
    borderRadius: 50,
    width: 55,
    height: 55,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});