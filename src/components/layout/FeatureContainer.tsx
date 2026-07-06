import React from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  ViewStyle, 
  Platform 
} from 'react-native';
import { theme } from '@/theme';
import { GlassPanel } from './GlassPanel';
import { Typography } from '../ui/Typography';


interface FeatureContainerProps {
  children: React.ReactNode;
  title?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const FeatureContainer: React.FC<FeatureContainerProps> = ({
  children,
  title,
  headerLeft,
  headerRight,
  scrollable = true,
  contentContainerStyle,
  style,
}) => {
  const renderHeader = () => {
    if (!title && !headerLeft && !headerRight) return null;

    return (
      <GlassPanel style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {headerLeft}
            </View>
            <View style={styles.headerTitle}>
              {title && (
                <Typography variant="title-lg" align="center">
                  {title}
                </Typography>
              )}
            </View>
            <View style={styles.headerRight}>
              {headerRight}
            </View>
          </View>
        </SafeAreaView>
      </GlassPanel>
    );
  };

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <View style={[styles.base, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      {renderHeader()}
      <ContentWrapper 
        style={styles.content}
        contentContainerStyle={[
          styles.contentInner,
          contentContainerStyle
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ContentWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    zIndex: 10,
    width: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      }
    })
  },
headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing['margin-mobile'],
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 4,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: theme.spacing['margin-mobile'],
    paddingTop: theme.spacing.xl,
    paddingBottom: 100, // Space for bottom tabs/navigation
  },
});
