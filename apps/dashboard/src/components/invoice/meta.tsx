import { DueDate } from "./due-date";
import { InvoiceNo } from "./invoice-no";
import { InvoiceTitle } from "./invoice-title";
import { IssueDate } from "./issue-date";

type Props = {
  teamId: string;
  invoiceNumber: string | null;
};

export function Meta({ teamId, invoiceNumber }: Props) {
  return (
    <div>
      <InvoiceTitle />

      <div className="flex flex-col gap-0.5">
        <div>
          <InvoiceNo teamId={teamId} invoiceNumber={invoiceNumber} />
        </div>
        <div>
          <IssueDate />
        </div>
        <div>
          <DueDate />
        </div>
      </div>
    </div>
  );
}
