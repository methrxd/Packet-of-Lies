import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

const indicatorPreview = [
  { type: "sha256", value: "e3b0c44298fc1c149afbf4c8996fb924..." },
  { type: "domain", value: "update-control.example" },
  { type: "ipv4", value: "185.44.12.90" },
  { type: "filename", value: "invoice_loader.exe" },
];

export default function IndicatorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Indicators"
        title="Structured observables workspace"
        description="Indicators bridge raw evidence and reusable threat knowledge, enabling searchable observables and linked case intelligence."
      />

      <Card className="border-white/6 bg-[var(--bg-card)]">
        <CardHeader>
          <CardDescription className="font-mono-ui text-[10px] tracking-[0.18em] uppercase">
            Indicator preview
          </CardDescription>
          <CardTitle className="font-heading text-xl">
            Typed observable examples
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {indicatorPreview.map((item) => (
            <div
              key={item.value}
              className="rounded-2xl border border-white/6 bg-white/2 p-4"
            >
              <Badge variant="outline" className="border-white/8 bg-white/4">
                {item.type}
              </Badge>
              <p className="font-mono-ui mt-4 break-all text-sm text-[var(--text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
