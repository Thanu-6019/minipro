import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../../src/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly', async () => {
    const { getByText } = await render(<Button label="Test Button" />);
    expect(getByText('Test Button')).toBeDefined();
  });
});
