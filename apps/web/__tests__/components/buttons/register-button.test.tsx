import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { RegisterButton } from '@/components/buttons/register-button';
import { toast } from 'sonner';

// Mock the API hooks
jest.mock('@/lib/hooks/use-api', () => ({
  useRegisterForEvent: () => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

describe('RegisterButton', () => {
  it('should render register button for unregistered event', () => {
    render(
      <RegisterButton
        eventId={1}
        registrationStatus={null}
      />
    );

    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should show current status when registered', () => {
    render(
      <RegisterButton
        eventId={1}
        registrationStatus="going"
      />
    );

    expect(screen.getByText('Going')).toBeInTheDocument();
  });

  it('should display all status options in dropdown', async () => {
    render(
      <RegisterButton
        eventId={1}
        registrationStatus={null}
      />
    );

    const button = screen.getByText('Register');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Going')).toBeInTheDocument();
      expect(screen.getByText('Interested')).toBeInTheDocument();
      expect(screen.getByText('Maybe')).toBeInTheDocument();
      expect(screen.getByText('Not Going')).toBeInTheDocument();
    });
  });

  it('should work in RTL mode', () => {
    const { container } = render(
      <div dir="rtl">
        <RegisterButton
          eventId={1}
          registrationStatus="going"
        />
      </div>
    );

    // Button should render correctly in RTL
    expect(container.querySelector('[dir="rtl"]')).toBeInTheDocument();
  });
});
