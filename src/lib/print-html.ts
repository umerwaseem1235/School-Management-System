/**
 * Triggers native browser print via an invisible in-page iframe.
 * Eliminates extraneous blank popup windows ("about:blank"), prevents popup
 * blocker interruptions, and keeps the user seamlessly on their active screen.
 */
export function printHtml(html: string): boolean {
  if (typeof window === "undefined" || !document) return false;

  const frameId = "__opus_print_frame__";
  const existingFrame = document.getElementById(frameId);
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = frameId;
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  if (!win) return false;
  const doc = win.document;
  if (!doc) return false;

  // Strip any inline window.print() script to prevent double-printing
  const cleanedHtml = html.replace(
    /<script[\s\S]*?window\.print\(\)[\s\S]*?<\/script>/gi,
    ""
  );

  doc.open();
  doc.write(cleanedHtml);
  doc.close();

  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch (err) {
      console.error("Print trigger failed:", err);
    }
  }, 250);

  return true;
}
