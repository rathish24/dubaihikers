import type { RegistrationReceipt } from "@dubaihikers/registrations";

type RegistrationConfirmationProps = {
  receipt: RegistrationReceipt;
  onDone: () => void;
};

export function RegistrationConfirmation({
  receipt,
  onDone,
}: RegistrationConfirmationProps) {
  return (
    <div className="interest-success" role="status">
      <p className="status-label">BOOKING CONFIRMED</p>
      <h3>Your place is reserved.</h3>
      <p>
        Reference <strong>{receipt.referenceNumber}</strong>. We&apos;ll contact you using the details provided with preparation information and next steps.
      </p>
      <button className="primary-button" onClick={onDone}>Done</button>
    </div>
  );
}
