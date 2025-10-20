"use client";
import { toast } from "app/hooks/use-toast";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Input } from "app/components/ui/input";
import { QRCode } from "app/components/ui/qr-code";
import { useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import { Copy, Download, QrCode as QrCodeIcon, Link } from "lucide-react";

function useSignUpLink(gymId: number) {
  const [signupLink, setSignupLink] = useState<string>("");
  const t = useTranslations("Components.GymAdminManager");

  useEffect(() => {
    // Only run on client side after component mounts
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = "/";
      url.searchParams.set("gi", gymId.toString());
      console.log(url.href);
      setSignupLink(url.href);
    }
  }, [gymId]);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API when available
        await navigator.clipboard.writeText(signupLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = signupLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.remove();
      }

      toast({
        title: t("signupLink.copySuccess"),
        description: t("signupLink.copySuccessDescription"),
      });

      return true;
    } catch (error) {
      console.error("Failed to copy signup link:", error);
      toast({
        title: t("signupLink.copyError"),
        description: t("signupLink.copyErrorDescription"),
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadQRCode = (qrRef: React.RefObject<SVGSVGElement>) => {
    if (!qrRef.current) {
      toast({
        title: t("signupLink.copyError"),
        description: t("signupLink.qrNotAvailable"),
        variant: "destructive",
      });
      return;
    }

    try {
      const svg = qrRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      // Create canvas for converting SVG to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions to match the QR code size
        const size = 200; // Match the QR code size
        canvas.width = size;
        canvas.height = size;

        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);

        // Draw the image
        ctx.drawImage(img, 0, 0, size, size);

        // Download as PNG
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `gym-signup-qr-${gymId || "code"}.png`;
        downloadLink.href = pngFile;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast({
          title: t("signupLink.copySuccess"),
          description: t("signupLink.qrDownloadSuccess"),
        });
      };

      img.onerror = (error) => {
        console.error("Image load error:", error);
        toast({
          title: t("signupLink.copyError"),
          description: t("signupLink.qrDownloadError"),
          variant: "destructive",
        });
      };

      // Create a proper SVG data URL
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;

      // Clean up the object URL after image loads
      const originalOnload = img.onload;
      img.onload = (ev: Event) => {
        URL.revokeObjectURL(url);
        if (originalOnload) {
          originalOnload.call(img, ev);
        }
      };
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast({
        title: t("signupLink.copyError"),
        description: t("signupLink.qrDownloadError"),
        variant: "destructive",
      });
    }
  };

  return {
    signupLink,
    copyToClipboard,
    downloadQRCode,
  };
}

function GymSignupLink({ gymId }: { gymId: number }) {
  const t = useTranslations("Components.GymAdminManager");

  const qrRef = useRef<SVGSVGElement>(null);

  const { signupLink, copyToClipboard, downloadQRCode } = useSignUpLink(gymId);

  const handleDownloadQR = () => {
    downloadQRCode(qrRef as React.RefObject<SVGSVGElement>);
  };

  return (
    <Card className="bg-transparent w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="h-5 w-5" />
          {t("signupLink.title")}
        </CardTitle>
        <CardDescription>{t("signupLink.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Signup Link Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <h3 className="font-medium">{t("signupLink.linkTitle")}</h3>
          </div>

          <div className="flex gap-2">
            <Input value={signupLink} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!signupLink}
              title={t("signupLink.copyButton")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {t("signupLink.linkDescription")}
          </p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-y-2">
            <QRCode
              ref={qrRef}
              value={signupLink}
              size={200}
              level="M"
              title={t("signupLink.qrAlt")}
              className="  "
            />
            <Button size="sm" onClick={handleDownloadQR} disabled={!signupLink}>
              <Download className="h-4 w-4 mr-2" />
              {t("signupLink.downloadButton")}
            </Button>
          </div>

          <div className="space-y-3 flex-1"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GymSignupLink;
