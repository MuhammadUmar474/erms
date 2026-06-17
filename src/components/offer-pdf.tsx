import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { UnitWithProject } from "@/lib/types";

const GREEN = "#1a3c34";
const LIGHT_GRAY = "#f5f5f5";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#333",
  },
  header: {
    backgroundColor: GREEN,
    color: "#fff",
    padding: 20,
    marginBottom: 20,
    marginTop: -40,
    marginLeft: -40,
    marginRight: -40,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  rowAlt: {
    flexDirection: "row",
    paddingVertical: 4,
    backgroundColor: LIGHT_GRAY,
  },
  label: {
    width: "40%",
    color: "#666",
    fontSize: 10,
    paddingLeft: 8,
  },
  value: {
    width: "60%",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingRight: 8,
  },
  priceBox: {
    backgroundColor: GREEN,
    color: "#fff",
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  pricePerSqft: {
    fontSize: 9,
    opacity: 0.7,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 7,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 1.4,
  },
});

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtPrice(n: number): string {
  return `AED ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface OfferPDFProps {
  unit: UnitWithProject;
}

function DataRow({
  label,
  value,
  alt,
}: {
  label: string;
  value: string;
  alt?: boolean;
}) {
  return (
    <View style={alt ? styles.rowAlt : styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function OfferPDF({ unit }: OfferPDFProps) {
  const project = unit.projects;
  const pricePerSqft =
    unit.total_area > 0 ? unit.price_aed / unit.total_area : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>R.</Text>
          <Text style={styles.headerSubtitle}>
            Reportage Properties — Sales Offer
          </Text>
        </View>

        {/* Project Info */}
        <Text style={styles.sectionTitle}>Project Information</Text>
        <DataRow label="Project" value={project?.name ?? unit.project_id} />
        <DataRow
          label="Location"
          value={project?.location ?? "Dubai"}
          alt
        />
        {project?.handover && (
          <DataRow label="Handover" value={project.handover} />
        )}

        {/* Unit Details */}
        <Text style={styles.sectionTitle}>Unit Details</Text>
        <DataRow label="Unit Number" value={unit.unit_number} />
        <DataRow label="Category" value={unit.category} alt />
        <DataRow label="Bedrooms" value={unit.bedrooms} />
        {unit.sub_type && (
          <DataRow label="Sub-type" value={`Type ${unit.sub_type}`} alt />
        )}
        {unit.floor && <DataRow label="Floor / Plot" value={unit.floor} />}
        {unit.view && (
          <DataRow label="View" value={unit.view} alt />
        )}
        {unit.payment_plan && (
          <DataRow label="Payment Plan" value={unit.payment_plan} />
        )}

        {/* Area Breakdown */}
        <Text style={styles.sectionTitle}>Area Breakdown</Text>
        <DataRow label="Internal Area" value={`${fmt(unit.internal_area)} sq.ft`} />
        <DataRow
          label="External Area"
          value={`${fmt(unit.external_area)} sq.ft`}
          alt
        />
        <DataRow
          label="Total Area"
          value={`${fmt(unit.total_area)} sq.ft`}
        />
        {unit.plot_area && (
          <DataRow
            label="Plot Area"
            value={`${fmt(unit.plot_area)} sq.ft`}
            alt
          />
        )}

        {/* Price */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>{fmtPrice(unit.price_aed)}</Text>
          <Text style={styles.pricePerSqft}>
            {fmtPrice(pricePerSqft)} per sq.ft
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Reportage Properties | Tollfree: 800 77 55 2 | reportagegroup.com
          </Text>
          <Text style={styles.disclaimer}>
            This offer is for informational purposes only and does not constitute
            a binding agreement. All plans, areas, prices, and details are
            approximate and subject to change. The developer reserves the right
            to make revisions at any time.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
