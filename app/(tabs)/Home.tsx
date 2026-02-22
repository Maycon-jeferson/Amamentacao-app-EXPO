import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Link } from 'expo-router';
import React, { useState } from 'react';
import { colors } from '../../constants/theme';
import Agenda from '../components/Agenda';

const CARD_WIDTH = 110;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  android: { elevation: 4 },
});

export default function Home() {
  const [breastfeedingPressed, setBreastfeedingPressed] = useState(false);

  // Carrosel
  const fraldasUltimoSalvo = 'Ultima frauda a 3h';
  const mamadeirasUltimoSalvo = 'Ultima mamadeira a 4h';
  const sonoUltimoSalvo = 'Ultimo sono a 8h';

  const carouselItems = [
    { title: 'Fraldas', href: '/Fraudas', ultimoSalvo: fraldasUltimoSalvo },
    { title: 'Mamadeiras', href: '/Mamadeira', ultimoSalvo: mamadeirasUltimoSalvo },
    { title: 'Sono', href: '/Sono', ultimoSalvo: sonoUltimoSalvo },
  ];

  return (
    <View style={styles.pageWrap}>
      <ScrollView style={styles.scrollWrap} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Hora da Ação</Text>

          {/* BOTÕES PRINCIPAIS */}
          <View style={styles.buttonContainer}>
          <Link href="/Table" asChild>
            <Pressable style={({ pressed }) => [styles.mainButton, cardShadow, pressed && styles.mainButtonPressed]}>
              <View style={styles.linkButton}>
                <View style={styles.iconCircle}>
                  <Image source={require('../../assets/images/table.png')} style={styles.mainIcon} />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href="/Breastfeeding" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.mainButton,
                styles.mainButtonCenterSize,
                cardShadow,
                (pressed || breastfeedingPressed) && styles.mainButtonCenter,
                pressed && styles.mainButtonPressed,
              ]}
              onPressIn={() => setBreastfeedingPressed(true)}
              onPressOut={() => setBreastfeedingPressed(false)}
            >
              <View style={styles.linkButton}>
                <View style={[styles.iconCircleCenter, (breastfeedingPressed) && styles.iconCircleAccent]}>
                  <Image
                    source={require('../../assets/images/breastfeeding.png')}
                    style={styles.centerIcon}
                  />
                </View>
              </View>
            </Pressable>
          </Link>

          <Link href="/Baby" asChild>
            <Pressable style={({ pressed }) => [styles.mainButton, cardShadow, pressed && styles.mainButtonPressed]}>
              <View style={styles.linkButton}>
                <View style={styles.iconCircle}>
                  <Image source={require('../../assets/images/baby-line.png')} style={styles.mainIcon} />
                </View>
              </View>
            </Pressable>
          </Link>
        </View>

        {/* CARROSSEL */}
        <View style={styles.utilidadesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {carouselItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.carouselCard,
                  cardShadow,
                  pressed && styles.utilButtonPressed,
                ]}
              >
                <Link href={item.href as any} asChild>
                  <View style={styles.carouselLink}>
                    <View style={styles.carouselTextBox}>
                      <Text style={styles.carouselTitle}>{item.title}</Text>
                      <Text style={styles.carouselPlaceholder}>{item.ultimoSalvo || 'err'}</Text>
                    </View>
                  </View>
                </Link>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

        <View style={styles.agendaWrap}>
          <Agenda />
        </View>
      </ScrollView>

      {/* RODAPÉ - réplica dos botões principais */}
      <View style={[styles.rodape, cardShadow]}>
        <Link href="/Table" asChild>
          <Pressable style={({ pressed }) => [styles.rodapeBtn, pressed && styles.rodapeBtnPressed]}>
            <View style={styles.rodapeIconCircle}>
              <Image source={require('../../assets/images/table.png')} style={styles.rodapeIcon} />
            </View>
          </Pressable>
        </Link>
        <Link href="/Breastfeeding" asChild>
          <Pressable style={({ pressed }) => [styles.rodapeBtn, (pressed || breastfeedingPressed) && styles.rodapeBtnCenter, pressed && styles.rodapeBtnPressed]} onPressIn={() => setBreastfeedingPressed(true)} onPressOut={() => setBreastfeedingPressed(false)}>
            <View style={[styles.rodapeIconCircle, breastfeedingPressed && styles.iconCircleAccent]}>
              <Image source={require('../../assets/images/breastfeeding.png')} style={styles.rodapeIconCenter} />
            </View>
          </Pressable>
        </Link>
        <Link href="/Baby" asChild>
          <Pressable style={({ pressed }) => [styles.rodapeBtn, pressed && styles.rodapeBtnPressed]}>
            <View style={styles.rodapeIconCircle}>
              <Image source={require('../../assets/images/baby-line.png')} style={styles.rodapeIcon} />
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
  },
  scrollWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  agendaWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    paddingHorizontal: 20,
  },
  container: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 28,
  },

  /* BOTÕES PRINCIPAIS */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },

  mainButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainButtonCenterSize: {
    minWidth: 110,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  mainButtonCenter: {
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
  },

  mainButtonPressed: {
    opacity: 0.85,
  },

  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircleCenter: {
    width: 120,
    height: 120,
    borderRadius: 56,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircleAccent: {
    backgroundColor: colors.accent,
  },

  mainIcon: {
    width: 36,
    height: 36,
  },

  centerIcon: {
    width: 56,
    height: 56,
  },

  /* CARROSSEL */
  utilidadesContainer: {
    width: '100%',
    marginTop: 30,
  },

  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 30,
  },

  carouselCard: {
    width: 110,
    height: 80,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  utilButtonPressed: {
    opacity: 0.9,
  },

  carouselLink: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  carouselTextBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  carouselTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  carouselPlaceholder: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  /* RODAPÉ - réplica dos botões principais */
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
  rodapeBtn: {
    padding: 8,
    borderRadius: 20,
  },
  rodapeBtnPressed: {
    opacity: 0.85,
  },
  rodapeBtnCenter: {
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  rodapeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodapeIcon: {
    width: 26,
    height: 26,
  },
  rodapeIconCenter: {
    width: 32,
    height: 32,
  },
});
