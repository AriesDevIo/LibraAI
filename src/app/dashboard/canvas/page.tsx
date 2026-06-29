import { redirect } from "next/navigation";

/**
 * The standalone canvas board has been retired: the freeform canvas now lives
 * INSIDE a document (open a document → switch to the Canvas view), where it
 * persists on the document row. This route only exists to send old links home.
 */
export default function DashboardCanvasPage() {
  redirect("/dashboard");
}
