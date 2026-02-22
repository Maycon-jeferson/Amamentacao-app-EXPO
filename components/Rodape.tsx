import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const ROTAS_PRINCIPAIS = [
  { href: '/Table', icon: require('../assets/images/table.png'), label: 'Tabela' },
  { href: '/Breastfeeding', icon: require('../assets/images/breastfeeding.png'), label: 'Amamentar' },
  { href: '/Baby', icon: require('../assets/images/baby-line.png'), label: 'Bebê' },
] as const;

const rodapeShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 8 },
});

export default function Rodape() {
  const pathname = usePathname();
  const pathNormalizado = (pathname || '').replace(/\/$/, '') || '';

  // Nunca exibir a página atual; Home sempre no centro; 3 ícones: esquerda, Home, direita
  const outrasRotas = ROTAS_PRINCIPAIS.filter((r) => pathNormalizado !== r.href);
  const esquerda = outrasRotas[0];
  const direita = outrasRotas.length >= 3 ? outrasRotas[2] : outrasRotas[1] ?? outrasRotas[0];

  const link = (rota: { href: string; icon: number; label: string } | undefined, isCenter: boolean) => {
    if (!rota) return null;
    return (
      <Link href={rota.href as any} asChild>
        <Pressable
          style={({ pressed }) => [isCenter ? styles.rodapeItemHome : styles.rodapeItem, !isCenter && pressed && styles.rodapeItemPressed]}
          accessibilityLabel={rota.label}
        >
          {isCenter ? (
            <View style={styles.iconCircle}>
              <Ionicons name="home" size={28} color={colors.primary} />
            </View>
          ) : (
            <View style={styles.iconCircle}>
              <Image source={rota.icon} style={styles.icon} resizeMode="contain" />
            </View>
          )}
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={[styles.rodape, rodapeShadow]}>
      {link(esquerda, false)}
      {link({ href: '/', icon: 0, label: 'Início' }, true)}
      {link(direita, false)}
    </View>
  );
}

const styles = StyleSheet.create({
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  rodapeItem: {
    padding: 8,
    borderRadius: 20,
  },
  rodapeItemHome: {
    padding: 8,
    borderRadius: 20,
  },
  rodapeItemPressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 32,
    height: 32,
  },
});
