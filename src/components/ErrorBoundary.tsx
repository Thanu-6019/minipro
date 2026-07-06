import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../components/ui/Typography';
import { logger } from '../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Typography variant="headline-md" color="#B3261E">
            Something went wrong
          </Typography>
          <Typography variant="body-md" color="#49454F" style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFBFE',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
});
