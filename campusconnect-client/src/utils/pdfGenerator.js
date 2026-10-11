import { jsPDF } from "jspdf";

/**
 * Downloads an official PDF for a Campus Announcement (Notice / Advisory / Placement).
 * If a custom attachmentUrl is provided, it downloads that file directly.
 * Otherwise, it dynamically generates an authentic institutional circular PDF.
 */
export async function downloadNoticePdf(announcement) {
  if (announcement.attachmentUrl) {
    // If an uploaded document exists, open or trigger download
    const link = document.createElement("a");
    link.href = announcement.attachmentUrl;
    link.download = announcement.attachmentName || `${announcement.title}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate authentic institutional PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(79, 70, 229); // Electric Indigo
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFillColor(245, 158, 11); // Amber Gold
  doc.rect(0, 8, pageWidth, 2.5, "F");

  // 2. Institution Header
  let y = 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("CAMPUSCONNECT ACADEMIC NETWORK", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("DIRECTORATE OF ACADEMIC AFFAIRS & ALUMNI RELATIONS", pageWidth / 2, y, { align: "center" });

  y += 4.5;
  doc.setFontSize(8.5);
  doc.text("University Placement, Career Services & Student Welfare Cell", pageWidth / 2, y, { align: "center" });

  // 3. Dividing Line
  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);

  // 4. Circular Banner / Badge
  y += 7;
  const categoryLabel = (announcement.category || "NOTICE").toUpperCase();
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(79, 70, 229);
  doc.text(`OFFICIAL ${categoryLabel} NOTIFICATION`, pageWidth / 2, y + 6, { align: "center" });

  // 5. Reference & Metadata Details
  y += 16;
  const refCode = announcement._id
    ? announcement._id.slice(-6).toUpperCase()
    : Math.floor(100000 + Math.random() * 900000);
  const year = new Date(announcement.createdAt || Date.now()).getFullYear();
  const issueDate = new Date(announcement.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Ref. No: CC/ADMIN/${year}/${refCode}`, margin, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Date of Issue: ${issueDate}`, pageWidth - margin, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Issued By: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text("Alumni Directorate (CampusConnect Academic & Placement Council)", margin + 18, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Circulation: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text("All Faculty Members, Enrolled Students & Batch Representatives", margin + 20, y);

  // 6. Dividing Line
  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 7. Subject Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("SUBJECT: ", margin + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);

  const subjectLines = doc.splitTextToSize(announcement.title.toUpperCase(), contentWidth - 28);
  doc.text(subjectLines, margin + 24, y + 6);

  // 8. Notice Content / Detail
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const detailLines = doc.splitTextToSize(announcement.detail, contentWidth);
  doc.text(detailLines, margin, y, { lineHeightFactor: 1.5 });

  const detailHeight = detailLines.length * 5.5;
  y += detailHeight + 8;

  // 9. Timeline / Deadline Highlight Box (if provided)
  if (announcement.deadline) {
    doc.setFillColor(254, 243, 199); // Amber light tint
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`SCHEDULE / DEADLINE: ${announcement.deadline}`, margin + 5, y + 7);
    y += 17;
  }

  // 10. Direct Link Note (if provided)
  if (announcement.link) {
    doc.setFillColor(238, 242, 255); // Indigo light tint
    doc.setDrawColor(99, 102, 241);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(67, 56, 202);
    doc.text("OFFICIAL APPLICATION / REGISTRATION LINK: ", margin + 5, y + 7);
    doc.setFont("helvetica", "normal");
    const linkStr = announcement.link.length > 55 ? `${announcement.link.substring(0, 52)}...` : announcement.link;
    doc.text(linkStr, margin + 85, y + 7);
    y += 17;
  }

  // 11. Endorsement / Signature Block
  y = Math.max(y + 10, 225);

  // Signature Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Alumni Directorate", pageWidth - margin - 5, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Campus Placement & Academic Advisory Council", pageWidth - margin - 5, y, { align: "right" });
  y += 4;
  doc.text("CampusConnect Alumni Relations", pageWidth - margin - 5, y, { align: "right" });

  // Official Stamp Stamp Graphic Box
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y - 14, 48, 18, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text("CAMPUSCONNECT", margin + 24, y - 9, { align: "center" });
  doc.text("OFFICIAL VERIFIED", margin + 24, y - 5, { align: "center" });
  doc.setFontSize(6.5);
  doc.text("ADMINISTRATIVE SEAL", margin + 24, y - 1, { align: "center" });

  // 12. Bottom Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is an authenticated electronically generated university notice issued via CampusConnect Social Network.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Save the PDF
  const safeFilename = `${(announcement.title || "Campus_Notice").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFilename);
}
