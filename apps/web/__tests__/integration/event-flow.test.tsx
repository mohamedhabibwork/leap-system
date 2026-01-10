import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { RegisterButton } from '@/components/buttons/register-button';

/**
 * Integration tests for event registration flow
 * Tests the complete user journey from viewing to registering
 */

describe('Event Registration Flow', () => {
  it('should complete full registration workflow', async () => {
    // Mock API responses
    const mockRegister = jest.fn().mockResolvedValue({
      id: 1,
      eventId: 1,
      status: 'going',
    });

    jest.mock('@/lib/hooks/use-api', () => ({
      useRegisterForEvent: () => ({
        mutateAsync: mockRegister,
        isPending: false,
      }),
    }));

    render(
      <RegisterButton
        eventId={1}
        registrationStatus={null}
      />
    );

    // Initial state
    expect(screen.getByText('Register')).toBeInTheDocument();

    // Open dropdown
    fireEvent.click(screen.getByText('Register'));

    // Select "Going"
    await waitFor(() => {
      const goingOption = screen.getByText('Going');
      expect(goingOption).toBeInTheDocument();
      fireEvent.click(goingOption);
    });

    // Verify API was called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        id: 1,
        data: { status: 'going' },
      });
    });
  });

  it('should handle registration errors gracefully', async () => {
    const mockRegister = jest.fn().mockRejectedValue(new Error('Network error'));

    jest.mock('@/lib/hooks/use-api', () => ({
      useRegisterForEvent: () => ({
        mutateAsync: mockRegister,
        isPending: false,
      }),
    }));

    render(
      <RegisterButton
        eventId={1}
        registrationStatus={null}
      />
    );

    // Attempt registration
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      const goingOption = screen.getByText('Going');
      fireEvent.click(goingOption);
    });

    // Should still be on Register after error
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });
});
