import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = {
  title: 'Forgot password',
  description: 'Reset your password – we’ll send you a link by email.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
